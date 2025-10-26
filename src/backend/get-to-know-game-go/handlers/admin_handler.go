package handlers

import (
	"fmt"
	"log"
	"strconv"

	"get-to-know-game-go/models"
	"get-to-know-game-go/repositories"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

// AdminHandler handles admin-related requests
type AdminHandler struct {
	sessionRepo  repositories.GameSessionRepository
	playerRepo   repositories.PlayerRepository
	questionRepo repositories.QuestionRepository
	trackingRepo repositories.TrackingRepository
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(
	sessionRepo repositories.GameSessionRepository,
	playerRepo repositories.PlayerRepository,
	questionRepo repositories.QuestionRepository,
	trackingRepo repositories.TrackingRepository,
) *AdminHandler {
	return &AdminHandler{
		sessionRepo:  sessionRepo,
		playerRepo:   playerRepo,
		questionRepo: questionRepo,
		trackingRepo: trackingRepo,
	}
}

// GetStats handles GET /api/admin/stats - dashboard statistics
func (h *AdminHandler) GetStats(c *fiber.Ctx) error {
	ctx := c.Context()

	// Get basic counts
	totalPlayers, err := h.playerRepo.Count(ctx)
	if err != nil {
		log.Printf("Error getting player count: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get player count"})
	}

	totalSessions, err := h.sessionRepo.Count(ctx)
	if err != nil {
		log.Printf("Error getting session count: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get session count"})
	}

	// Get completed sessions
	completedSessions, err := h.sessionRepo.CountWithFilter(ctx, bson.M{
		"compatibilityScore": bson.M{"$ne": nil},
	})
	if err != nil {
		log.Printf("Error getting completed session count: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get completed session count"})
	}

	// Calculate average score
	avgScore, err := h.sessionRepo.GetAverageScore(ctx)
	if err != nil {
		log.Printf("Error getting average score: %v", err)
		avgScore = 0
	}

	// Get tracking statistics
	uniqueVisitors, err := h.trackingRepo.GetUniqueVisitors(ctx)
	if err != nil {
		log.Printf("Error getting unique visitors: %v", err)
		uniqueVisitors = 0
	}

	totalPageViews, err := h.trackingRepo.GetTotalPageViews(ctx)
	if err != nil {
		log.Printf("Error getting total page views: %v", err)
		totalPageViews = 0
	}

	// Get event counts
	topEvents, err := h.trackingRepo.GetEventCounts(ctx)
	if err != nil {
		log.Printf("Error getting event counts: %v", err)
		topEvents = make(map[string]int64)
	}

	// Get recent sessions
	recentSessions, err := h.sessionRepo.GetRecentSessions(ctx, 10)
	if err != nil {
		log.Printf("Error getting recent sessions: %v", err)
		recentSessions = []models.SessionAnalytics{}
	}

	stats := models.AdminStats{
		TotalPlayers:        totalPlayers,
		TotalSessions:       totalSessions,
		CompletedSessions:   completedSessions,
		AverageScore:        avgScore,
		SessionsBySection:   make(map[string]int64), // TODO: Implement section-based session counting
		UniqueVisitors:      uniqueVisitors,
		TotalPageViews:      totalPageViews,
		AverageSessionTime:  0, // TODO: Calculate from tracking data
		TopEvents:           topEvents,
		RecentSessions:      recentSessions,
	}

	return c.JSON(stats)
}

// GetVisitorStats handles GET /api/admin/stats/visitors - time-series visitor data
func (h *AdminHandler) GetVisitorStats(c *fiber.Ctx) error {
	period := c.Query("period", "day")
	
	ctx := c.Context()
	stats, err := h.trackingRepo.GetVisitorStatsByPeriod(ctx, period)
	if err != nil {
		log.Printf("Error getting visitor stats: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get visitor statistics"})
	}

	return c.JSON(stats)
}

// GetSessions handles GET /api/admin/sessions - list all sessions with analytics
func (h *AdminHandler) GetSessions(c *fiber.Ctx) error {
	// Parse pagination parameters
	pageStr := c.Query("page", "1")
	limitStr := c.Query("limit", "20")
	
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 20
	}

	ctx := c.Context()
	sessions, err := h.sessionRepo.GetRecentSessions(ctx, limit)
	if err != nil {
		log.Printf("Error getting sessions: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get sessions"})
	}

	return c.JSON(fiber.Map{
		"sessions": sessions,
		"page":     page,
		"limit":    limit,
		"total":    len(sessions),
	})
}

// GetQuestions handles GET /api/admin/questions - list all questions grouped by section
func (h *AdminHandler) GetQuestions(c *fiber.Ctx) error {
	ctx := c.Context()
	questions, err := h.questionRepo.GetAll(ctx)
	if err != nil {
		log.Printf("Error getting questions: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get questions"})
	}

	// Group questions by section
	questionsBySection := make(map[string][]models.Question)
	for _, question := range questions {
		questionsBySection[question.Section] = append(questionsBySection[question.Section], question)
	}

	return c.JSON(fiber.Map{
		"questionsBySection": questionsBySection,
		"totalQuestions":     len(questions),
	})
}

// CreateQuestion handles POST /api/admin/questions - add new question
func (h *AdminHandler) CreateQuestion(c *fiber.Ctx) error {
	var req models.CreateQuestionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if req.Section == "" || req.QuestionText == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Section and questionText are required"})
	}

	question := models.Question{
		Section:      req.Section,
		QuestionText: req.QuestionText,
	}

	ctx := c.Context()
	createdQuestion, err := h.questionRepo.Create(ctx, question)
	if err != nil {
		log.Printf("Error creating question: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create question"})
	}

	return c.Status(201).JSON(createdQuestion)
}

// UpdateQuestion handles PUT /api/admin/questions/:id - update question
func (h *AdminHandler) UpdateQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Question ID is required"})
	}

	var req models.UpdateQuestionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if req.Section == "" || req.QuestionText == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Section and questionText are required"})
	}

	// Get existing question
	ctx := c.Context()
	existingQuestion, err := h.questionRepo.GetByID(ctx, id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Question not found"})
	}

	// Update fields
	existingQuestion.Section = req.Section
	existingQuestion.QuestionText = req.QuestionText

	err = h.questionRepo.Update(ctx, id, existingQuestion)
	if err != nil {
		log.Printf("Error updating question: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update question"})
	}

	return c.JSON(existingQuestion)
}

// DeleteQuestion handles DELETE /api/admin/questions/:id - remove question
func (h *AdminHandler) DeleteQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Question ID is required"})
	}

	ctx := c.Context()
	err := h.questionRepo.Delete(ctx, id)
	if err != nil {
		log.Printf("Error deleting question: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete question"})
	}

	return c.Status(200).JSON(fiber.Map{"message": "Question deleted successfully"})
}

// GetSections handles GET /api/admin/sections - list all unique sections
func (h *AdminHandler) GetSections(c *fiber.Ctx) error {
	ctx := c.Context()
	questions, err := h.questionRepo.GetAll(ctx)
	if err != nil {
		log.Printf("Error getting questions for sections: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get sections"})
	}

	// Extract unique sections
	sections := make(map[string]int)
	for _, question := range questions {
		sections[question.Section]++
	}

	return c.JSON(fiber.Map{
		"sections": sections,
		"totalSections": len(sections),
	})
}

// CreateSection handles POST /api/admin/sections - create a new section
func (h *AdminHandler) CreateSection(c *fiber.Ctx) error {
	var req struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Section name is required"})
	}

	// Check if section already exists
	ctx := c.Context()
	questions, err := h.questionRepo.GetAll(ctx)
	if err != nil {
		log.Printf("Error getting questions: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to check existing sections"})
	}

	for _, question := range questions {
		if question.Section == req.Name {
			return c.Status(409).JSON(fiber.Map{"error": "Section already exists"})
		}
	}

	// Create a sample question to establish the section
	sampleQuestion := models.Question{
		Section:      req.Name,
		QuestionText: "Sample question - please edit or delete this",
	}

	createdQuestion, err := h.questionRepo.Create(ctx, sampleQuestion)
	if err != nil {
		log.Printf("Error creating section: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create section"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Section created successfully",
		"section": req.Name,
		"sampleQuestionId": createdQuestion.ID.Hex(),
	})
}

// UpdateSection handles PUT /api/admin/sections/:oldName - rename section
func (h *AdminHandler) UpdateSection(c *fiber.Ctx) error {
	oldName := c.Params("oldName")
	if oldName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Old section name is required"})
	}

	var req struct {
		NewName string `json:"newName"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.NewName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "New section name is required"})
	}

	// Get all questions with the old section name
	ctx := c.Context()
	questions, err := h.questionRepo.GetAll(ctx)
	if err != nil {
		log.Printf("Error getting questions: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get questions"})
	}

	// Update questions with the old section name
	updatedCount := 0
	for _, question := range questions {
		if question.Section == oldName {
			question.Section = req.NewName
			err = h.questionRepo.Update(ctx, question.ID.Hex(), question)
			if err != nil {
				log.Printf("Error updating question %s: %v", question.ID.Hex(), err)
				continue
			}
			updatedCount++
		}
	}

	return c.JSON(fiber.Map{
		"message": "Section renamed successfully",
		"oldName": oldName,
		"newName": req.NewName,
		"updatedQuestions": updatedCount,
	})
}

// DeleteSection handles DELETE /api/admin/sections/:name - delete section and all questions
func (h *AdminHandler) DeleteSection(c *fiber.Ctx) error {
	sectionName := c.Params("name")
	if sectionName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Section name is required"})
	}

	// Get all questions in the section
	ctx := c.Context()
	questions, err := h.questionRepo.GetAll(ctx)
	if err != nil {
		log.Printf("Error getting questions: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get questions"})
	}

	// Delete all questions in the section
	deletedCount := 0
	for _, question := range questions {
		if question.Section == sectionName {
			err = h.questionRepo.Delete(ctx, question.ID.Hex())
			if err != nil {
				log.Printf("Error deleting question %s: %v", question.ID.Hex(), err)
				continue
			}
			deletedCount++
		}
	}

	return c.JSON(fiber.Map{
		"message": "Section and questions deleted successfully",
		"sectionName": sectionName,
		"deletedQuestions": deletedCount,
	})
}

// BulkCreateQuestions handles POST /api/admin/questions/bulk - create multiple questions
func (h *AdminHandler) BulkCreateQuestions(c *fiber.Ctx) error {
	var req struct {
		Questions []models.CreateQuestionRequest `json:"questions"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.Questions) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "At least one question is required"})
	}

	ctx := c.Context()
	var createdQuestions []models.Question
	var errors []string

	for i, questionReq := range req.Questions {
		// Validate required fields
		if questionReq.Section == "" || questionReq.QuestionText == "" {
			errors = append(errors, fmt.Sprintf("Question %d: Section and questionText are required", i+1))
			continue
		}

		question := models.Question{
			Section:      questionReq.Section,
			QuestionText: questionReq.QuestionText,
		}

		createdQuestion, err := h.questionRepo.Create(ctx, question)
		if err != nil {
			log.Printf("Error creating question %d: %v", i+1, err)
			errors = append(errors, fmt.Sprintf("Question %d: Failed to create", i+1))
			continue
		}

		createdQuestions = append(createdQuestions, createdQuestion)
	}

	response := fiber.Map{
		"created": len(createdQuestions),
		"total":   len(req.Questions),
		"questions": createdQuestions,
	}

	if len(errors) > 0 {
		response["errors"] = errors
	}

	return c.Status(201).JSON(response)
}


// GetFilteredAnalytics handles POST /api/admin/analytics/filtered - advanced analytics with filtering
func (h *AdminHandler) GetFilteredAnalytics(c *fiber.Ctx) error {
	var filter models.AnalyticsFilter
	if err := c.BodyParser(&filter); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	ctx := c.Context()
	events, err := h.trackingRepo.GetFilteredEvents(ctx, filter)
	if err != nil {
		log.Printf("Error getting filtered analytics: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get filtered analytics"})
	}

	return c.JSON(fiber.Map{
		"events": events,
		"filter": filter,
		"total":  len(events),
	})
}

// GetGeographicAnalytics handles GET /api/admin/analytics/geographic - location-based analytics
func (h *AdminHandler) GetGeographicAnalytics(c *fiber.Ctx) error {
	ctx := c.Context()
	geoData, err := h.trackingRepo.GetGeographicData(ctx)
	if err != nil {
		log.Printf("Error getting geographic analytics: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get geographic analytics"})
	}

	return c.JSON(fiber.Map{
		"geographicData": geoData,
		"total":          len(geoData),
	})
}

// GetPerformanceMetrics handles GET /api/admin/performance - system performance metrics
func (h *AdminHandler) GetPerformanceMetrics(c *fiber.Ctx) error {
	ctx := c.Context()
	metrics, err := h.trackingRepo.GetPerformanceMetrics(ctx)
	if err != nil {
		log.Printf("Error getting performance metrics: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get performance metrics"})
	}

	return c.JSON(metrics)
}
