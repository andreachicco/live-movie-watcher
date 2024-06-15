package main

import (
	"fmt"
	"net/http"
	"wemovie/controllers"
	"wemovie/midllewares"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/auth/signup", controllers.SignUp)
	mux.HandleFunc("/auth/signin", controllers.SignIn)

	mux.Handle("/rooms", midllewares.NewAuthenticator(controllers.Create))

	fmt.Println("Server is starting...")
	http.ListenAndServe(":80", mux)
}
