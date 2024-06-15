package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"strings"
)

type Jwt string

type JwtHeader struct {
	Typ string `json:"typ"`
	Alg string `json:"alg"`
}

func EncodeJwt(header []byte, payload []byte) (string, string, string) {

	encoded_header := base64.URLEncoding.EncodeToString(header)
	encoded_payload := base64.URLEncoding.EncodeToString(payload)

	h := hmac.New(sha256.New, []byte("secret"))

	h.Write([]byte(encoded_header + "." + encoded_payload))
	signature := hex.EncodeToString(h.Sum(nil))

	encoded_signature := base64.URLEncoding.EncodeToString([]byte(signature))

	return encoded_header, encoded_payload, encoded_signature
}

func GenerateJwt(payload any) (Jwt, error) {

	header := &JwtHeader{Typ: "JWT", Alg: "HS256"}
	jwt_header, err := json.Marshal(header)

	if err != nil {
		return "", err
	}

	jwt_payload, err := json.Marshal(payload)

	if err != nil {
		return "", err
	}

	encoded_header, encoded_payload, encoded_signature := EncodeJwt(jwt_header, jwt_payload)

	jwt := encoded_header + "." + encoded_payload + "." + encoded_signature

	return Jwt(jwt), nil
}

func ValidateJwt(token Jwt) (bool, error) {

	if token == "" {
		return false, nil
	}

	jwt_components := strings.Split(string(token), ".")

	header, err := base64.URLEncoding.DecodeString(jwt_components[0])

	if err != nil {
		return false, err
	}

	payload, err := base64.URLEncoding.DecodeString(jwt_components[1])

	if err != nil {
		return false, err
	}

	signature := jwt_components[2]

	_, _, encoded_signature := EncodeJwt(header, payload)

	if signature != encoded_signature {
		return false, nil
	}

	return true, nil
}
