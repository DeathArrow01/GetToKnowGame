package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"get-to-know-game-go/config"
	"get-to-know-game-go/database"
	"get-to-know-game-go/handlers"
	"get-to-know-game-go/repositories"
	"get-to-know-game-go/services"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to MongoDB
	mongoDB, err := database.NewMongoDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer mongoDB.Close()

	// Initialize repositories
	questionRepo := repositories.NewQuestionRepository(mongoDB.GetCollection("questions"))
	playerRepo := repositories.NewPlayerRepository(mongoDB.GetCollection("players"))
	sessionRepo := repositories.NewGameSessionRepository(mongoDB.GetCollection("sessions"))

	// Initialize services
	compatibilityService := services.NewCompatibilityService()
	databaseSeeder := services.NewDatabaseSeeder(questionRepo)

	// Seed database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := databaseSeeder.SeedQuestions(ctx); err != nil {
		log.Printf("Failed to seed database: %v", err)
	}

	// Initialize handlers
	questionsHandler := handlers.NewQuestionsHandler(questionRepo)
	playersHandler := handlers.NewPlayersHandler(playerRepo)
	sessionsHandler := handlers.NewSessionsHandler(sessionRepo, playerRepo, compatibilityService)

	// Setup Fiber app
	app := fiber.New()

	// Configure CORS
	app.Use(func(c *fiber.Ctx) error {
		// Allow multiple origins for development and production
		origin := c.Get("Origin")
		allowedOrigins := []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"https://localhost:5173",
			"https://localhost:3000",
		}
		
		// Check if origin is allowed
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}
		
		// For production, also allow Render domains
		if !allowed && (origin == "" || 
			(len(origin) > 0 && (origin[:8] == "https://" || origin[:7] == "http://"))) {
			allowed = true
		}
		
		if allowed {
			c.Set("Access-Control-Allow-Origin", origin)
		}
		
		c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")
		c.Set("Access-Control-Allow-Credentials", "true")
		
		if c.Method() == "OPTIONS" {
			return c.SendStatus(200)
		}
		
		return c.Next()
	})

	// API routes
	api := app.Group("/api")

	// Questions routes
	questions := api.Group("/questions")
	questions.Get("", questionsHandler.GetQuestions)
	questions.Get("/:id", questionsHandler.GetQuestion)
	questions.Post("", questionsHandler.CreateQuestion)
	questions.Put("/:id", questionsHandler.UpdateQuestion)
	questions.Delete("/:id", questionsHandler.DeleteQuestion)

	// Players routes
	players := api.Group("/players")
	players.Post("", playersHandler.CreatePlayer)
	players.Get("/:id", playersHandler.GetPlayer)
	players.Put("/:id", playersHandler.UpdatePlayer)
	players.Delete("/:id", playersHandler.DeletePlayer)

	// Sessions routes
	sessions := api.Group("/sessions")
	sessions.Post("", sessionsHandler.CreateSession)
	sessions.Get("/:sessionId", sessionsHandler.GetSession)
	sessions.Post("/:sessionId/join", sessionsHandler.JoinSession)
	sessions.Put("/:sessionId/answers", sessionsHandler.SubmitAnswers)
	sessions.Delete("/:sessionId", sessionsHandler.DeleteSession)

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := app.Listen(":" + cfg.Port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Shutdown Fiber app
	if err := app.Shutdown(); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
