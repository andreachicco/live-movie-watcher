package midllewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"wemovie/auth"
	"wemovie/common"
)

type MyHandler func(w http.ResponseWriter, r *http.Request)

type Authenticate struct {
	handler MyHandler
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

	is_valid, err := auth.ValidateJwt(auth.Jwt(jwt[1]))

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

	a.handler(w, r)
}

func NewAuthenticator(handler MyHandler) *Authenticate {
	return &Authenticate{handler}
}
