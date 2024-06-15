package common

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Response[T any] struct {
	Status  HttpStatus
	Message string
	Data    *T
}

func (r *Response[T]) Send(w http.ResponseWriter) {
	w.WriteHeader(int(r.Status))
	dat, _ := json.Marshal(r)
	fmt.Fprintf(w, string(dat))
}
