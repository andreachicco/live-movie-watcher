package common

type HttpStatus int

const (
	OK                    HttpStatus = 200
	CREATED               HttpStatus = 201
	UNAUTHORIZED          HttpStatus = 401
	CONFLICT              HttpStatus = 409
	INTERNAL_SERVER_ERROR HttpStatus = 500
)
