package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// AdminAuthMiddleware creates middleware for admin authentication
func AdminAuthMiddleware(adminKey string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// If no admin key is configured, deny access
		if adminKey == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Admin access not configured",
			})
		}
		
		// Check for admin key in Authorization header (Bearer token format)
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			// Fallback: check for X-Admin-Key header
			authHeader = c.Get("X-Admin-Key")
		}
		
		// Extract key from Bearer token format or use direct header value
		var providedKey string
		if strings.HasPrefix(authHeader, "Bearer ") {
			providedKey = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			providedKey = authHeader
		}
		
		// If no key provided or key doesn't match, deny access
		if providedKey == "" || providedKey != adminKey {
			return c.Status(401).JSON(fiber.Map{
				"error": "Unauthorized - Invalid admin key",
			})
		}
		
		// Key is valid, continue to next handler
		return c.Next()
	}
}
