package repositories

import (
	"context"
	"fmt"
	"time"

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

// GetRecentSessions retrieves recent sessions with all data
func (r *GameSessionRepositoryImpl) GetRecentSessions(ctx context.Context, limit int) ([]models.SessionAnalytics, error) {
	opts := &mongo.FindOptions{
		Sort:  bson.M{"createdAt": -1},
		Limit: int64(limit),
	}

	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var sessions []models.GameSession
	if err = cursor.All(ctx, &sessions); err != nil {
		return nil, err
	}

	// Convert to SessionAnalytics
	var analytics []models.SessionAnalytics
	for _, session := range sessions {
		analytics = append(analytics, models.SessionAnalytics{
			SessionID:   session.ID.Hex(),
			Player1ID:   session.Player1ID.Hex(),
			Player2ID:   session.Player2ID,
			CreatedAt:   session.CreatedAt,
			CompletedAt: session.CompletedAt,
			Score:       session.CompatibilityScore,
			IPAddress:   session.IPAddress,
			// Note: Player names, duration, page views, and events would need to be joined from other collections
		})
	}

	return analytics, nil
}


// GetAverageScore calculates the average compatibility score
func (r *GameSessionRepositoryImpl) GetAverageScore(ctx context.Context) (float64, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"compatibilityScore": bson.M{"$ne": nil}}},
		{"$group": bson.M{
			"_id": nil,
			"avgScore": bson.M{"$avg": "$compatibilityScore"},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var result []bson.M
	if err = cursor.All(ctx, &result); err != nil {
		return 0, err
	}

	if len(result) == 0 {
		return 0, nil
	}

	if avgScore, ok := result[0]["avgScore"].(float64); ok {
		return avgScore, nil
	}

	return 0, fmt.Errorf("unexpected result format")
}

// UpdateCompletedAt sets the completion timestamp for a session
func (r *GameSessionRepositoryImpl) UpdateCompletedAt(ctx context.Context, id string, completedAt time.Time) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid session ID format: %v", err)
	}

	update := bson.M{"$set": bson.M{"completedAt": completedAt}}
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("session not found")
	}

	return nil
}