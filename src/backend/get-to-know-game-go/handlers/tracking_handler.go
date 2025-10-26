package handlers

import (
	"log"
	"time"

	"get-to-know-game-go/config"
	"get-to-know-game-go/models"
	"get-to-know-game-go/repositories"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TrackingHandler handles tracking-related requests
type TrackingHandler struct {
	trackingRepo repositories.TrackingRepository
	config       *config.Config
}

// NewTrackingHandler creates a new tracking handler
func NewTrackingHandler(trackingRepo repositories.TrackingRepository, cfg *config.Config) *TrackingHandler {
	return &TrackingHandler{
		trackingRepo: trackingRepo,
		config:       cfg,
	}
}

// Track handles POST /api/track - store tracking events from frontend
func (h *TrackingHandler) Track(c *fiber.Ctx) error {
	// Check if tracking is enabled
	if !h.config.TrackingEnabled {
		return c.Status(200).JSON(fiber.Map{"status": "tracking_disabled"})
	}

	var req models.TrackingRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("Error parsing tracking request: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Get IP address
	ip := c.IP()
	if forwarded := c.Get("X-Forwarded-For"); forwarded != "" {
		ip = forwarded
	}

	// Create tracking event
	event := models.TrackingEvent{
		ID:        primitive.NewObjectID(),
		PlayerID:  req.ID,
		Event:     req.Event,
		URL:       req.URL,
		Time:      time.Unix(req.Time/1000, 0),
		UserAgent: req.UserAgent,
		Referrer:  req.Referrer,
		IPAddress: ip,
		Data:      req.Data,
	}

	// Save to MongoDB
	ctx := c.Context()
	_, err := h.trackingRepo.Create(ctx, event)
	if err != nil {
		log.Printf("Error saving tracking event: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save tracking event"})
	}

	return c.Status(200).JSON(fiber.Map{"status": "tracked"})
}

// Pixel handles GET /api/pixel.gif - pixel tracking
func (h *TrackingHandler) Pixel(c *fiber.Ctx) error {
	// Check if tracking is enabled
	if !h.config.TrackingEnabled {
		// Still return the pixel even if tracking is disabled
		return h.returnPixel(c)
	}

	// Get query parameters
	id := c.Query("id", "guest")
	event := c.Query("event", "pixel_view")
	url := c.Query("url", "")
	timeStr := c.Query("time", "")
	
	// Get IP address
	ip := c.IP()
	if forwarded := c.Get("X-Forwarded-For"); forwarded != "" {
		ip = forwarded
	}

	// Parse time if provided
	var eventTime time.Time
	if timeStr != "" {
		if timestamp, err := time.Parse("", timeStr); err == nil {
			eventTime = timestamp
		} else {
			eventTime = time.Now()
		}
	} else {
		eventTime = time.Now()
	}

	// Create tracking event
	trackingEvent := models.TrackingEvent{
		ID:        primitive.NewObjectID(),
		PlayerID:  id,
		Event:     event,
		URL:       url,
		Time:      eventTime,
		UserAgent: c.Get("User-Agent"),
		Referrer:  c.Get("Referer"),
		IPAddress: ip,
	}

	// Save to MongoDB
	ctx := c.Context()
	_, err := h.trackingRepo.Create(ctx, trackingEvent)
	if err != nil {
		log.Printf("Error saving pixel tracking event: %v", err)
		// Don't fail the pixel request, just log the error
	}

	return h.returnPixel(c)
}

// returnPixel returns a 1x1 transparent GIF
func (h *TrackingHandler) returnPixel(c *fiber.Ctx) error {
	// 1x1 transparent GIF data
	gifData := []byte{
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
		0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00,
		0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
		0x44, 0x01, 0x00, 0x3B,
	}

	c.Set("Content-Type", "image/gif")
	c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Set("Pragma", "no-cache")
	c.Set("Expires", "0")
	
	return c.Send(gifData)
}
