package services

import (
	"fmt"

	"get-to-know-game-go/models"
)

// CompatibilityService handles compatibility score calculations
type CompatibilityService struct{}

// NewCompatibilityService creates a new compatibility service
func NewCompatibilityService() *CompatibilityService {
	return &CompatibilityService{}
}

// CalculateScore calculates the compatibility score between two players
func (s *CompatibilityService) CalculateScore(player1Answers, player2Answers []models.PlayerAnswer) (int, error) {
	if len(player1Answers) != len(player2Answers) {
		return 0, fmt.Errorf("both players must answer the same number of questions")
	}

	matches := 0
	totalQuestions := len(player1Answers)

	// Create a map of player2 answers for quick lookup
	player2AnswerMap := make(map[string]string)
	for _, answer := range player2Answers {
		player2AnswerMap[answer.QuestionID.Hex()] = answer.Response
	}

	// Count matches where both players said "Yay!" or "I don't care!"
	for _, player1Answer := range player1Answers {
		player2Response, exists := player2AnswerMap[player1Answer.QuestionID.Hex()]
		if !exists {
			continue
		}

		// Only count matches where both said "Yay!" or "I don't care!"
		if (player1Answer.Response == models.Yay || player1Answer.Response == models.DontCare) &&
			(player2Response == models.Yay || player2Response == models.DontCare) &&
			player1Answer.Response == player2Response {
			matches++
		}
	}

	// Calculate percentage and round to nearest whole number
	score := int(float64(matches)/float64(totalQuestions)*100 + 0.5)
	return score, nil
}
