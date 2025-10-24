package repositories

import (
	"get-to-know-game-go/models"

	"go.mongodb.org/mongo-driver/mongo"
)

// PlayerRepositoryImpl implements PlayerRepository
type PlayerRepositoryImpl struct {
	*BaseRepository[models.Player]
}

// NewPlayerRepository creates a new player repository
func NewPlayerRepository(collection *mongo.Collection) PlayerRepository {
	return &PlayerRepositoryImpl{
		BaseRepository: NewBaseRepository[models.Player](collection),
	}
}
