package auth

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	const HASH_COST = 12

	passHash, err := bcrypt.GenerateFromPassword([]byte(password), HASH_COST)

	if err != nil {
		return "", err
	}

	return string(passHash), nil
}

func IsPasswordOk(password string, passHash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(passHash), []byte(password))

	return err == nil
}
