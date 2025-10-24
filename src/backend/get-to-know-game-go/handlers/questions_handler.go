package handlers

import (
	"get-to-know-game-go/models"
	"get-to-know-game-go/repositories"

	"github.com/gofiber/fiber/v2"
)

// QuestionsHandler handles question-related HTTP requests
type QuestionsHandler struct {
	questionRepo repositories.QuestionRepository
}

// NewQuestionsHandler creates a new questions handler
func NewQuestionsHandler(questionRepo repositories.QuestionRepository) *QuestionsHandler {
	return &QuestionsHandler{
		questionRepo: questionRepo,
	}
}

// GetQuestions handles GET /api/questions
func (h *QuestionsHandler) GetQuestions(c *fiber.Ctx) error {
	questions, err := h.questionRepo.GetAll(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	return c.JSON(questions)
}

// GetQuestion handles GET /api/questions/:id
func (h *QuestionsHandler) GetQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	question, err := h.questionRepo.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Question not found"})
	}

	return c.JSON(question)
}

// CreateQuestion handles POST /api/questions
func (h *QuestionsHandler) CreateQuestion(c *fiber.Ctx) error {
	var req models.CreateQuestionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	question := models.Question{
		Section:      req.Section,
		QuestionText: req.QuestionText,
	}

	createdQuestion, err := h.questionRepo.Create(c.Context(), question)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create question"})
	}

	return c.Status(fiber.StatusCreated).JSON(createdQuestion)
}

// UpdateQuestion handles PUT /api/questions/:id
func (h *QuestionsHandler) UpdateQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateQuestionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	question := models.Question{
		Section:      req.Section,
		QuestionText: req.QuestionText,
	}

	err := h.questionRepo.Update(c.Context(), id, question)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Question not found"})
	}

	return c.JSON(fiber.Map{"message": "Question updated successfully"})
}

// DeleteQuestion handles DELETE /api/questions/:id
func (h *QuestionsHandler) DeleteQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.questionRepo.Delete(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Question not found"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
