package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	MongoURI    string
	DatabaseName string
	Port        string
}

// Load loads configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	config := &Config{
		MongoURI:     getEnv("MONGODB_URI", "mongodb://admin:password@localhost:27017"),
		DatabaseName: getEnv("DATABASE_NAME", "GetToKnowGame"),
		Port:         getEnv("PORT", "5012"),
	}

	return config
}

// getEnv gets an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
