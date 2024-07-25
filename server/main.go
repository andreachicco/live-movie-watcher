package main

import (
	"fmt"
	"net/http"
	"wemovie/controllers"
	"wemovie/room"
)

func main() {
	room.TestRoom = &room.Room{
		Name:          "Test Room",
		NPartecipants: 0,
		Clients:       make([]*room.Connection, 0),
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/auth/signup", controllers.SignUp)
	mux.HandleFunc("/auth/signin", controllers.SignIn)

	mux.HandleFunc("/rooms", controllers.Join)
	// mux.Handle("/rooms", midllewares.NewAuthenticator(controllers.Join))

	fmt.Println("Server is starting...")
	http.ListenAndServe(":80", mux)
}
