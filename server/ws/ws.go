package ws

import (
	"bufio"
	"crypto/sha1"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strings"
)

type Ws struct {
	conn   net.Conn
	header http.Header
	buff   *bufio.ReadWriter
}

func New(w http.ResponseWriter, header http.Header) (*Ws, error) {
	hj, ok := w.(http.Hijacker)

	if !ok {
		return nil, errors.New("connection does not support hijacking")
	}

	conn, buff, err := hj.Hijack()
	if err != nil {
		return nil, errors.New("hijacking error")
	}

	return &Ws{conn, header, buff}, nil
}

func genAcceptKey(ws *Ws) string {
	wsKey := ws.header.Get("Sec-Websocket-Key")

	hasher := sha1.New()
	key := wsKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
	hasher.Write([]byte(key))

	wsAccept := base64.StdEncoding.EncodeToString(hasher.Sum(nil))

	return wsAccept
}

func (ws *Ws) Handshake() error {
	key := genAcceptKey(ws)

	reqLines := []string{
		"HTTP/1.1 101 Web Socket Protocol Handshake",
		"Server: go/echoserver",
		"Upgrade: WebSocket",
		"Connection: Upgrade",
		"Sec-WebSocket-Accept: " + key,
		"", // required for extra CRLF
		"", // required for extra CRLF
	}

	return ws.write([]byte(strings.Join(reqLines, "\r\n")))
}

func (ws *Ws) write(header []byte) error {
	_, err := ws.buff.Write(header)
	if err != nil {
		return err
	}

	return ws.buff.Flush()
}

func (ws *Ws) read(size int) ([]byte, error) {

	buff := make([]byte, 0)

	const CHUNK_SIZE = 2048

	for {

		if len(buff) == size {
			break
		}

		sz := CHUNK_SIZE
		remaining := size - len(buff)

		if sz > remaining {
			sz = remaining
		}

		chunk := make([]byte, sz)

		n, err := ws.buff.Read(chunk)

		if err != nil && err != io.EOF {
			return buff, err
		}

		buff = append(buff, chunk[:n]...)
	}

	return buff, nil
}

type Frame struct {
	IsFragment bool
	OpCode     byte
	IsMasked   bool
	Payload    []byte
}

func (ws *Ws) Recv() (*Frame, error) {
	header, err := ws.read(2)

	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return nil, err
	}

	isFragment := header[0]&0x80 == 0x0
	opCode := header[0] & 0xF

	isMasked := header[1]&0x80 == 0x0

	var payloadLen uint64
	payloadLen = uint64(header[1] & 0x7F)

	if payloadLen == 126 {
		newLen, err := ws.read(2)

		if err != nil {
			fmt.Fprintf(os.Stderr, err.Error()+"\n")
			return nil, err
		}

		payloadLen = uint64(binary.BigEndian.Uint16(newLen))
	} else if payloadLen == 127 {
		newLen, err := ws.read(8)

		if err != nil {
			fmt.Fprintf(os.Stderr, err.Error()+"\n")
			return nil, err
		}

		payloadLen = uint64(binary.BigEndian.Uint64(newLen))
	}

	mask, err := ws.read(4)
	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return nil, err
	}

	data, err := ws.read(int(payloadLen))
	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return nil, err
	}

	for i := uint64(0); i < payloadLen; i++ {
		data[i] ^= mask[i%4]
	}

	return &Frame{
		IsFragment: isFragment,
		OpCode:     opCode,
		IsMasked:   isMasked,
		Payload:    data,
	}, nil
}

func (ws *Ws) Close() {
	ws.conn.Close()
}
