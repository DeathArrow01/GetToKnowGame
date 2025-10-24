package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// Player represents a player in the game
type Player struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name string            `bson:"name" json:"name"`
}
