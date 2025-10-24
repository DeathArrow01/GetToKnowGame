package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// PlayerAnswer represents a player's answer to a question
type PlayerAnswer struct {
	QuestionID primitive.ObjectID `bson:"questionId" json:"questionId"`
	Response   string             `bson:"response" json:"response"`
}
