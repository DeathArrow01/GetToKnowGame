package services

import (
	"context"
	"log"

	"get-to-know-game-go/models"
	"get-to-know-game-go/repositories"
)

// DatabaseSeeder handles seeding the database with initial data
type DatabaseSeeder struct {
	questionRepo repositories.QuestionRepository
}

// NewDatabaseSeeder creates a new database seeder
func NewDatabaseSeeder(questionRepo repositories.QuestionRepository) *DatabaseSeeder {
	return &DatabaseSeeder{
		questionRepo: questionRepo,
	}
}

// SeedQuestions seeds the database with sample questions if the collection is empty
func (s *DatabaseSeeder) SeedQuestions(ctx context.Context) error {
	// Check if questions already exist
	existingQuestions, err := s.questionRepo.GetAll(ctx)
	if err != nil {
		return err
	}

	if len(existingQuestions) > 0 {
		log.Println("Questions already seeded, skipping...")
		return nil
	}

	// Sample questions from the specification
	questions := []models.Question{
		// Food Section
		{Section: "Food", QuestionText: "Pizza Diavola"},
		{Section: "Food", QuestionText: "Sushi"},
		{Section: "Food", QuestionText: "Pineapple on pizza"},

		// Entertainment Section
		{Section: "Entertainment", QuestionText: "Marvel movies"},
		{Section: "Entertainment", QuestionText: "Anime"},
		{Section: "Entertainment", QuestionText: "TikTok"},

		// Lifestyle Section
		{Section: "Lifestyle", QuestionText: "Night owl"},
		{Section: "Lifestyle", QuestionText: "Gym"},
		{Section: "Lifestyle", QuestionText: "Reading books"},

		// Travel Section
		{Section: "Travel", QuestionText: "Beach holidays"},
		{Section: "Travel", QuestionText: "Camping"},
		{Section: "Travel", QuestionText: "Visiting museums"},
	}

	// Insert each question
	for _, question := range questions {
		_, err := s.questionRepo.Create(ctx, question)
		if err != nil {
			return err
		}
	}

	log.Printf("Successfully seeded %d questions", len(questions))
	return nil
}
