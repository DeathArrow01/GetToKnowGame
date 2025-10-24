package repositories

import (
	"context"

	"get-to-know-game-go/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository defines the basic CRUD operations
type Repository[T any] interface {
	Create(ctx context.Context, entity T) (T, error)
	GetByID(ctx context.Context, id string) (T, error)
	GetAll(ctx context.Context) ([]T, error)
	Update(ctx context.Context, id string, entity T) error
	Delete(ctx context.Context, id string) error
}

// QuestionRepository defines question-specific operations
type QuestionRepository interface {
	Repository[models.Question]
}

// PlayerRepository defines player-specific operations
type PlayerRepository interface {
	Repository[models.Player]
}

// GameSessionRepository defines game session-specific operations
type GameSessionRepository interface {
	Repository[models.GameSession]
	GetByID(ctx context.Context, id string) (models.GameSession, error)
	UpdateAnswers(ctx context.Context, id string, playerID string, answers []models.PlayerAnswer) error
	UpdateCompatibilityScore(ctx context.Context, id string, score int) error
	UpdatePlayer2(ctx context.Context, id string, player2ID primitive.ObjectID) error
}
