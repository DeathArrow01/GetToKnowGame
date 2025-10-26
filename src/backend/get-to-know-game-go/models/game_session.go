package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GameSession represents a game session between two players
type GameSession struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Player1ID          primitive.ObjectID `bson:"player1Id" json:"player1Id"`
	Player2ID          *primitive.ObjectID `bson:"player2Id,omitempty" json:"player2Id,omitempty"`
	Player1Answers     []PlayerAnswer     `bson:"player1Answers" json:"player1Answers"`
	Player2Answers     *[]PlayerAnswer    `bson:"player2Answers,omitempty" json:"player2Answers,omitempty"`
	CompatibilityScore *int               `bson:"compatibilityScore,omitempty" json:"compatibilityScore,omitempty"`
	Player2Name        *string            `bson:"player2Name,omitempty" json:"player2Name,omitempty"`
	CreatedAt          time.Time          `bson:"createdAt" json:"createdAt"`
	CompletedAt        *time.Time         `bson:"completedAt,omitempty" json:"completedAt,omitempty"`
	IPAddress          string             `bson:"ipAddress" json:"ipAddress"`
}
