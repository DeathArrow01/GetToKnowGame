package repositories

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// BaseRepository provides common MongoDB operations
type BaseRepository[T any] struct {
	collection *mongo.Collection
}

// NewBaseRepository creates a new base repository
func NewBaseRepository[T any](collection *mongo.Collection) *BaseRepository[T] {
	return &BaseRepository[T]{
		collection: collection,
	}
}

// Create inserts a new document
func (r *BaseRepository[T]) Create(ctx context.Context, entity T) (T, error) {
	var zero T
	result, err := r.collection.InsertOne(ctx, entity)
	if err != nil {
		return zero, err
	}

	// Get the created document with the generated ID
	if objectID, ok := result.InsertedID.(primitive.ObjectID); ok {
		// Fetch the document back to get the complete entity with ID
		var createdEntity T
		err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&createdEntity)
		if err != nil {
			return zero, err
		}
		return createdEntity, nil
	}

	return entity, nil
}

// GetByID retrieves a document by ID
func (r *BaseRepository[T]) GetByID(ctx context.Context, id string) (T, error) {
	var zero T
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return zero, fmt.Errorf("invalid ID format: %v", err)
	}

	var entity T
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&entity)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return zero, fmt.Errorf("document not found")
		}
		return zero, err
	}

	return entity, nil
}

// GetAll retrieves all documents
func (r *BaseRepository[T]) GetAll(ctx context.Context) ([]T, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var entities []T
	if err = cursor.All(ctx, &entities); err != nil {
		return nil, err
	}

	return entities, nil
}

// Update updates a document by ID
func (r *BaseRepository[T]) Update(ctx context.Context, id string, entity T) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid ID format: %v", err)
	}

	update := bson.M{"$set": entity}
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("document not found")
	}

	return nil
}

// Delete removes a document by ID
func (r *BaseRepository[T]) Delete(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid ID format: %v", err)
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("document not found")
	}

	return nil
}
