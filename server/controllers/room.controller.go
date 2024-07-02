package controllers

import (
	"fmt"
	"net/http"
	"os"
	"wemovie/ws"
)

func Create(w http.ResponseWriter, r *http.Request) {
	// user := r.Context().Value("user").(*models.User)
	ws, err := ws.New(w, r.Header)
	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return
	}

	err = ws.Handshake()

	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error()+"\n")
		return
	}

	defer ws.Close()

	for {
		frame, err := ws.Recv()
		if err != nil {
			fmt.Fprintf(os.Stderr, err.Error()+"\n")
			break
		}

		fmt.Println(string(frame.Payload))

		if frame.OpCode == 8 {
			break
		}
	}
}
