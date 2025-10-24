package handlers

import (
	"get-to-know-game-go/models"
	"get-to-know-game-go/repositories"
	"get-to-know-game-go/services"

	"github.com/gofiber/fiber/v2"
)

// SessionsHandler handles session-related HTTP requests
type SessionsHandler struct {
	sessionRepo           repositories.GameSessionRepository
	playerRepo            repositories.PlayerRepository
	compatibilityService  *services.CompatibilityService
}

// NewSessionsHandler creates a new sessions handler
func NewSessionsHandler(
	sessionRepo repositories.GameSessionRepository,
	playerRepo repositories.PlayerRepository,
	compatibilityService *services.CompatibilityService,
) *SessionsHandler {
	return &SessionsHandler{
		sessionRepo:          sessionRepo,
		playerRepo:           playerRepo,
		compatibilityService: compatibilityService,
	}
}

// CreateSession handles POST /api/sessions
func (h *SessionsHandler) CreateSession(c *fiber.Ctx) error {
	var req models.CreateSessionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Create Player 1
	player1 := models.Player{Name: req.Player1Name}
	createdPlayer1, err := h.playerRepo.Create(c.Context(), player1)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create player 1"})
	}

	// Create GameSession
	session := models.GameSession{
		Player1ID:      createdPlayer1.ID,
		Player1Answers: []models.PlayerAnswer{},
		Player2Name:    &req.Player2Name,
	}

	createdSession, err := h.sessionRepo.Create(c.Context(), session)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create session"})
	}

	response := fiber.Map{
		"sessionId": createdSession.ID.Hex(),
		"link":      "/session/" + createdSession.ID.Hex(),
		"player1Id": createdPlayer1.ID.Hex(),
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// GetSession handles GET /api/sessions/:sessionId
func (h *SessionsHandler) GetSession(c *fiber.Ctx) error {
	sessionID := c.Params("sessionId")
	session, err := h.sessionRepo.GetByID(c.Context(), sessionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Session not found"})
	}

	// Get player names
	player1, err := h.playerRepo.GetByID(c.Context(), session.Player1ID.Hex())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch player 1"})
	}

	// Determine game completion status
	isPlayer2Joined := session.Player2ID != nil
	isPlayer2Completed := session.Player2Answers != nil && len(*session.Player2Answers) > 0
	isGameComplete := isPlayer2Joined && isPlayer2Completed && session.CompatibilityScore != nil

	response := fiber.Map{
		"sessionId": session.ID.Hex(),
		"player1Id": session.Player1ID.Hex(),
		"player1Name": player1.Name,
		"player2Name": session.Player2Name,
		"player1Answers": session.Player1Answers,
		"compatibilityScore": session.CompatibilityScore,
		"isPlayer2Joined": isPlayer2Joined,
		"isPlayer2Completed": isPlayer2Completed,
		"isGameComplete": isGameComplete,
	}

	// Add player 2 info if they've joined
	if session.Player2ID != nil {
		player2, err := h.playerRepo.GetByID(c.Context(), session.Player2ID.Hex())
		if err == nil {
			response["player2Id"] = session.Player2ID.Hex()
			response["player2Name"] = player2.Name
		}
		if session.Player2Answers != nil {
			response["player2Answers"] = session.Player2Answers
		}
	}

	return c.JSON(response)
}

// JoinSession handles POST /api/sessions/:sessionId/join
func (h *SessionsHandler) JoinSession(c *fiber.Ctx) error {
	sessionID := c.Params("sessionId")
	var req models.JoinSessionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Get the session
	session, err := h.sessionRepo.GetByID(c.Context(), sessionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Session not found"})
	}

	// Check if player 2 is already in the session
	if session.Player2ID != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Session is already full"})
	}

	// Create Player 2
	player2 := models.Player{Name: req.Player2Name}
	createdPlayer2, err := h.playerRepo.Create(c.Context(), player2)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create player 2"})
	}

	// Update the session with player 2
	err = h.sessionRepo.UpdatePlayer2(c.Context(), sessionID, createdPlayer2.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to join session"})
	}

	response := fiber.Map{
		"player2Id": createdPlayer2.ID.Hex(),
		"message":   "Successfully joined session",
	}

	return c.JSON(response)
}

// SubmitAnswers handles PUT /api/sessions/:sessionId/answers
func (h *SessionsHandler) SubmitAnswers(c *fiber.Ctx) error {
	sessionID := c.Params("sessionId")
	var req models.SubmitAnswersRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Get the session
	session, err := h.sessionRepo.GetByID(c.Context(), sessionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Session not found"})
	}

	// Update answers
	err = h.sessionRepo.UpdateAnswers(c.Context(), sessionID, req.PlayerID, req.Answers)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	// If this is Player 2 submitting answers, calculate compatibility score
	if session.Player2ID != nil && session.Player2ID.Hex() == req.PlayerID {
		// Get updated session to ensure we have the latest answers
		updatedSession, err := h.sessionRepo.GetByID(c.Context(), sessionID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch updated session"})
		}

		if updatedSession.Player2Answers != nil {
			score, err := h.compatibilityService.CalculateScore(updatedSession.Player1Answers, *updatedSession.Player2Answers)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to calculate compatibility score"})
			}

			err = h.sessionRepo.UpdateCompatibilityScore(c.Context(), sessionID, score)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update compatibility score"})
			}
		}
	}

	return c.JSON(fiber.Map{"message": "Answers submitted successfully"})
}

// DeleteSession handles DELETE /api/sessions/:sessionId
func (h *SessionsHandler) DeleteSession(c *fiber.Ctx) error {
	sessionID := c.Params("sessionId")
	err := h.sessionRepo.Delete(c.Context(), sessionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Session not found"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
