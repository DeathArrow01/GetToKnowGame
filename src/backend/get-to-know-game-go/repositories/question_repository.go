package repositories

import (
	"get-to-know-game-go/models"

	"go.mongodb.org/mongo-driver/mongo"
)

// QuestionRepositoryImpl implements QuestionRepository
type QuestionRepositoryImpl struct {
	*BaseRepository[models.Question]
}

// NewQuestionRepository creates a new question repository
func NewQuestionRepository(collection *mongo.Collection) QuestionRepository {
	return &QuestionRepositoryImpl{
		BaseRepository: NewBaseRepository[models.Question](collection),
	}
}
