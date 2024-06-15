package controllers

import (
	"fmt"
	"net/http"
	"wemovie/common"
)

func Create(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Create room")
	response := common.Response[int]{Status: common.CREATED, Message: "Room created succesfully", Data: nil}
	response.Send(w)
}
