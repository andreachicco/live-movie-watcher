package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"wemovie/messages"
	"wemovie/room"

	"github.com/andreachicco/gows"
)

func Join(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if len(username) == 0 {
		fmt.Fprintf(os.Stderr, "Username is not provided\n")
		return
	}

	ws, err := gows.New(w)
	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return
	}

	err = ws.HandShake(r.Header)

	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return
	}

	// user := r.Context().Value("user").(*models.User)
	connection := &room.Connection{
		Username: username,
		Ws:       ws,
	}

	//connect only if client isn't connected yet
	if !connection.IsConnected(room.TestRoom) {
		room.TestRoom.Clients = append(room.TestRoom.Clients, connection)
		room.TestRoom.NPartecipants += 1
	}

	joinMessage := &messages.Message[string]{
		Code: messages.NEW_USER_JOINED,
		Data: username,
	}

	data, err := json.Marshal(joinMessage)

	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return
	}

	frameToSend := &gows.Frame{
		FIN:        true,
		Mask:       false,
		OpCode:     gows.OP_TEXT,
		PayloadLen: uint64(len(data)),
		Payload:    data,
	}
	fmt.Printf("%s just joined %s\n", username, room.TestRoom.Name)
	connection.BroadcastTo(room.TestRoom, frameToSend)

	defer ws.Close()

	for {
		frame, err := ws.Recv()

		if err != nil {
			fmt.Fprintf(os.Stderr, err.Error()+"\n")
			break
		}

		if frame.OpCode == gows.OP_TEXT {

			var recvMessage *messages.Message[any]
			err := json.Unmarshal(frame.Payload, &recvMessage)

			if err != nil {
				fmt.Fprintf(os.Stderr, err.Error()+"\n")
				return
			}

			if recvMessage.Code == messages.MESSAGE_SENT {
				messageText, ok := recvMessage.Data.(string)

				if !ok {
					fmt.Fprintf(os.Stderr, "Something went wrong\n")
					break
				}

				messageData := &messages.MessageData{
					Username: username,
					Text:     messageText,
				}

				sendMessage := &messages.Message[*messages.MessageData]{
					Code: messages.MESSAGE_SENT,
					Data: messageData,
				}

				data, err := json.Marshal(sendMessage)

				if err != nil {
					fmt.Fprintf(os.Stderr, err.Error()+"\n")
					break
				}

				// fmt.Println(string(frame.Payload))
				frameToSend := &gows.Frame{
					FIN:        true,
					Mask:       false,
					OpCode:     gows.OP_TEXT,
					PayloadLen: uint64(len(data)),
					Payload:    data,
				}

				connection.BroadcastTo(room.TestRoom, frameToSend)
			}

		}

		if frame.OpCode == gows.OP_CLOSE_CONNECTION {
			fmt.Printf("%s left %s\n", username, room.TestRoom.Name)

			leaveMessage := &messages.Message[string]{
				Code: messages.USER_LEFT,
				Data: username,
			}

			data, err := json.Marshal(leaveMessage)

			if err != nil {
				fmt.Fprintf(os.Stderr, err.Error()+"\n")
				break
			}

			frameToSend := &gows.Frame{
				FIN:        true,
				Mask:       false,
				OpCode:     gows.OP_TEXT,
				PayloadLen: uint64(len(data)),
				Payload:    data,
			}

			connection.BroadcastTo(room.TestRoom, frameToSend)
			connection.LeaveRoom(room.TestRoom)
			break
		}
	}
}
