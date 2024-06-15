package models

type User struct {
	Username string `json:"username" bson:"_id"`
	Password string `json:"password" bson:"password"`
}

type JwtPayload struct {
	Username string `json:"username"`
	Exp      int32  `json:"exp"`
	Iat      int32  `json:"iat"`
}
