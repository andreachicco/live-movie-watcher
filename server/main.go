package main

import (
	"fmt"
	"net/http"
	"wemovie/controllers"
)

func main() {
	http.HandleFunc("/auth/signup", controllers.SignUp)
	http.HandleFunc("/auth/signin", controllers.SignIn)

	fmt.Println("Server is starting...")
	http.ListenAndServe(":80", nil)
}
