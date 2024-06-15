package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
	"wemovie/auth"
	"wemovie/common"
	"wemovie/database"
	"wemovie/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SignUp(w http.ResponseWriter, r *http.Request) {

	client := database.Connect()
	userColl := database.Collection(client, "user")

	var newUser models.User
	err := json.NewDecoder(r.Body).Decode(&newUser)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error during json decoding\n")
		response := common.Response[int]{Status: common.INTERNAL_SERVER_ERROR, Message: "Something went wrong...", Data: nil}
		response.Send(w)
		return
	}

	passHash, err := auth.HashPassword(newUser.Password)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error during password hashing\n")
		response := common.Response[int]{Status: common.INTERNAL_SERVER_ERROR, Message: "Something went wrong...", Data: nil}
		response.Send(w)
		return
	}

	newUser.Password = passHash

	res, err := database.InsertOne(userColl, newUser)

	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			response := common.Response[int]{Status: common.CONFLICT, Message: "Username already exists", Data: nil}
			response.Send(w)
			return
		}

		fmt.Fprintln(os.Stderr, err.Error())
		response := common.Response[*mongo.InsertOneResult]{Status: common.INTERNAL_SERVER_ERROR, Message: "Something went wrong...", Data: &res}
		response.Send(w)
		return
	}

	response := common.Response[int]{Status: common.CREATED, Message: "You have been signed up successfully", Data: nil}
	response.Send(w)
}

func SignIn(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error during json decoding\n")
		response := common.Response[int]{Status: common.INTERNAL_SERVER_ERROR, Message: "Something went wrong...", Data: nil}
		response.Send(w)
		return
	}

	client := database.Connect()
	userColl := database.Collection(client, "user")

	filter := bson.D{{Key: "_id", Value: user.Username}}
	foundUser, err := database.FindOne[models.User](userColl, filter)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			response := common.Response[int]{Status: common.UNAUTHORIZED, Message: "Invalid credentials", Data: nil}
			response.Send(w)
			return
		}

		fmt.Fprintf(os.Stderr, "Error during mongodb FindOne\n")
		response := common.Response[int]{Status: common.INTERNAL_SERVER_ERROR, Message: "Something went wrong...", Data: nil}
		response.Send(w)
		return
	}

	passOk := auth.IsPasswordOk(user.Password, foundUser.Password)

	if !passOk {
		response := common.Response[int]{Status: common.UNAUTHORIZED, Message: "Invalid credentials", Data: nil}
		response.Send(w)
		return
	}

	current_time := int32(time.Now().Unix())
	exp_time := current_time + 60*60*24 //1 day exp

	jwt_payload := models.JwtPayload{Username: user.Username, Iat: current_time, Exp: exp_time}

	jwt, err := auth.GenerateJwt(jwt_payload)

	if err != nil {
		response := common.Response[int]{Status: common.INTERNAL_SERVER_ERROR, Message: "Something went wrong...", Data: nil}
		response.Send(w)
		return
	}

	response := common.Response[auth.Jwt]{Status: common.OK, Message: "You have been signed in successfully", Data: &jwt}
	response.Send(w)
}
