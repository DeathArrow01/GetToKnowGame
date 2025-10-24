package repositories

import (
	"context"
	"fmt"

	"get-to-know-game-go/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// GameSessionRepositoryImpl implements GameSessionRepository
type GameSessionRepositoryImpl struct {
	*BaseRepository[models.GameSession]
}

// NewGameSessionRepository creates a new game session repository
func NewGameSessionRepository(collection *mongo.Collection) GameSessionRepository {
	return &GameSessionRepositoryImpl{
		BaseRepository: NewBaseRepository[models.GameSession](collection),
	}
}

// UpdateAnswers updates player answers in a game session
func (r *GameSessionRepositoryImpl) UpdateAnswers(ctx context.Context, id string, playerID string, answers []models.PlayerAnswer) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid session ID format: %v", err)
	}

	playerObjectID, err := primitive.ObjectIDFromHex(playerID)
	if err != nil {
		return fmt.Errorf("invalid player ID format: %v", err)
	}

	// Determine which player field to update
	var updateField string
	var session models.GameSession
	err = r.BaseRepository.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&session)
	if err != nil {
		return err
	}

	if session.Player1ID == playerObjectID {
		updateField = "player1Answers"
	} else if session.Player2ID != nil && *session.Player2ID == playerObjectID {
		updateField = "player2Answers"
	} else {
		return fmt.Errorf("player does not belong to this session")
	}

	update := bson.M{"$set": bson.M{updateField: answers}}
	result, err := r.BaseRepository.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("session not found")
	}

	return nil
}

// UpdateCompatibilityScore updates the compatibility score for a game session
func (r *GameSessionRepositoryImpl) UpdateCompatibilityScore(ctx context.Context, id string, score int) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid session ID format: %v", err)
	}

	update := bson.M{"$set": bson.M{"compatibilityScore": score}}
	result, err := r.BaseRepository.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("session not found")
	}

	return nil
}

// UpdatePlayer2 updates the session with player 2 information
func (r *GameSessionRepositoryImpl) UpdatePlayer2(ctx context.Context, id string, player2ID primitive.ObjectID) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid session ID format: %v", err)
	}

	update := bson.M{"$set": bson.M{"player2Id": player2ID}}
	result, err := r.BaseRepository.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("session not found")
	}

	return nil
}