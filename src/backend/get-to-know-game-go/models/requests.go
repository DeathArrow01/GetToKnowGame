package models

// CreateSessionRequest represents the request to create a new game session
type CreateSessionRequest struct {
	Player1Name string `json:"player1Name" binding:"required"`
	Player2Name string `json:"player2Name" binding:"required"`
}

// JoinSessionRequest represents the request for Player 2 to join a session
type JoinSessionRequest struct {
	Player2Name string `json:"player2Name" binding:"required"`
}

// SubmitAnswersRequest represents the request to submit player answers
type SubmitAnswersRequest struct {
	PlayerID string         `json:"playerId" binding:"required"`
	Answers  []PlayerAnswer `json:"answers" binding:"required"`
}

// CreatePlayerRequest represents the request to create a new player
type CreatePlayerRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdatePlayerRequest represents the request to update a player
type UpdatePlayerRequest struct {
	Name string `json:"name" binding:"required"`
}

// CreateQuestionRequest represents the request to create a new question
type CreateQuestionRequest struct {
	Section      string `json:"section" binding:"required"`
	QuestionText string `json:"questionText" binding:"required"`
}

// UpdateQuestionRequest represents the request to update a question
type UpdateQuestionRequest struct {
	Section      string `json:"section" binding:"required"`
	QuestionText string `json:"questionText" binding:"required"`
}
