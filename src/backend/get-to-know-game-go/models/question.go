package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// Question represents a question in the game
type Question struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Section      string             `bson:"section" json:"section"`
	QuestionText string             `bson:"questionText" json:"questionText"`
}
