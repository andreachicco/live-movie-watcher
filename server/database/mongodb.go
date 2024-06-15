package database

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const MONGO_DB_URI = "mongodb+srv://andreachicco:4PQqb29Jxr8zTCdw@wemovie.epaizgb.mongodb.net/?retryWrites=true&w=majority&appName=WeMovie"
const DB_NAME = "WeMovie"

func Connect() *mongo.Client {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(MONGO_DB_URI))
	if err != nil {
		panic(err)
	}

	return client
}

func Collection(client *mongo.Client, name string) *mongo.Collection {
	return client.Database(DB_NAME).Collection(name)
}

func InsertOne(collection *mongo.Collection, document interface{}) (*mongo.InsertOneResult, error) {
	return collection.InsertOne(context.TODO(), document)
}

func FindOne[T any](collection *mongo.Collection, filter interface{}) (T, error) {
	var data T
	err := collection.FindOne(context.TODO(), filter).Decode(&data)

	return data, err
}
