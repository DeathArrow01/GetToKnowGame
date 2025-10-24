package handlers

import (
	"get-to-know-game-go/models"
	"get-to-know-game-go/repositories"

	"github.com/gofiber/fiber/v2"
)

// PlayersHandler handles player-related HTTP requests
type PlayersHandler struct {
	playerRepo repositories.PlayerRepository
}

// NewPlayersHandler creates a new players handler
func NewPlayersHandler(playerRepo repositories.PlayerRepository) *PlayersHandler {
	return &PlayersHandler{
		playerRepo: playerRepo,
	}
}

// CreatePlayer handles POST /api/players
func (h *PlayersHandler) CreatePlayer(c *fiber.Ctx) error {
	var req models.CreatePlayerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	player := models.Player{
		Name: req.Name,
	}

	createdPlayer, err := h.playerRepo.Create(c.Context(), player)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create player"})
	}

	return c.Status(fiber.StatusCreated).JSON(createdPlayer)
}

// GetPlayer handles GET /api/players/:id
func (h *PlayersHandler) GetPlayer(c *fiber.Ctx) error {
	id := c.Params("id")
	player, err := h.playerRepo.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Player not found"})
	}

	return c.JSON(player)
}

// UpdatePlayer handles PUT /api/players/:id
func (h *PlayersHandler) UpdatePlayer(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdatePlayerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	player := models.Player{
		Name: req.Name,
	}

	err := h.playerRepo.Update(c.Context(), id, player)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Player not found"})
	}

	return c.JSON(fiber.Map{"message": "Player updated successfully"})
}

// DeletePlayer handles DELETE /api/players/:id
func (h *PlayersHandler) DeletePlayer(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.playerRepo.Delete(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Player not found"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
