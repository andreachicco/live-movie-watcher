package midllewares

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"wemovie/auth"
	"wemovie/common"
	"wemovie/models"
)

type MyHandler func(w http.ResponseWriter, r *http.Request)

type Authenticate struct {
	handler MyHandler
}

type Request struct {
	req  *http.Request
	User models.User
}

func (a *Authenticate) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Inside Authenticate middleware")

	auth_header := r.Header.Get("authorization")

	if !strings.HasPrefix(auth_header, "Bearer") {
		fmt.Fprintf(os.Stderr, "No header prefix provided\n")
		response := common.Response[int]{Status: common.UNAUTHORIZED, Message: "Unauthorized", Data: nil}
		response.Send(w)
		return
	}

	jwt := strings.Split(auth_header, " ")

	is_valid, user, err := auth.ValidateJwt(auth.Jwt(jwt[1]))

	if err != nil {
		fmt.Fprintf(os.Stderr, "Jwt validation error: "+err.Error()+"\n")
		response := common.Response[int]{Status: common.UNAUTHORIZED, Message: "Unauthorized", Data: nil}
		response.Send(w)
		return
	}

	if !is_valid {
		response := common.Response[int]{Status: common.UNAUTHORIZED, Message: "Unauthorized", Data: nil}
		response.Send(w)
		return
	}

	ctx := context.WithValue(r.Context(), "user", user)
	a.handler(w, r.WithContext(ctx))
}

func NewAuthenticator(handler MyHandler) *Authenticate {
	return &Authenticate{handler}
}
