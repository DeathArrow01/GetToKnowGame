# Go Backend Implementation Summary

## Overview
This Go backend provides the same functionality as the existing C# backend for the Get to Know Game. Both backends can run simultaneously and share the same MongoDB database.

## Architecture

### Project Structure
```
get-to-know-game-go/
├── config/           # Configuration management
├── database/         # MongoDB connection and database context
├── handlers/         # HTTP request handlers (Controllers)
├── models/           # Data models and DTOs
├── repositories/     # Data access layer
├── services/         # Business logic services
├── main.go          # Application entry point
├── go.mod           # Go module definition
├── Dockerfile       # Docker configuration
└── README.md        # Documentation
```

### Key Components

#### Models
- **Question**: Represents game questions with section and text
- **Player**: Represents game players with name
- **GameSession**: Represents game sessions with players and answers
- **PlayerAnswer**: Represents individual player answers
- **Request DTOs**: For API request/response handling

#### Repositories
- **BaseRepository**: Generic CRUD operations for MongoDB
- **QuestionRepository**: Question-specific operations
- **PlayerRepository**: Player-specific operations
- **GameSessionRepository**: Session-specific operations with custom methods

#### Services
- **CompatibilityService**: Calculates compatibility scores between players
- **DatabaseSeeder**: Seeds the database with sample questions

#### Handlers
- **QuestionsHandler**: Handles all question-related endpoints
- **PlayersHandler**: Handles all player-related endpoints
- **SessionsHandler**: Handles all session-related endpoints

## API Endpoints

All endpoints match the C# backend specification:

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Players
- `POST /api/players` - Create new player
- `GET /api/players/:id` - Get player by ID
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Sessions
- `POST /api/sessions` - Create new game session
- `GET /api/sessions/:sessionId` - Get session details
- `PUT /api/sessions/:sessionId/answers` - Submit player answers
- `DELETE /api/sessions/:sessionId` - Delete session

### Health Check
- `GET /health` - Health check endpoint

## Configuration

The application uses environment variables:
- `MONGODB_URI`: MongoDB connection string (default: mongodb://admin:password@localhost:27017)
- `DATABASE_NAME`: Database name (default: GetToKnowGame)
- `PORT`: Server port (default: 5012)
- `GIN_MODE`: Gin framework mode (debug/release)

## Database Compatibility

The Go backend uses the same MongoDB collections and document structure as the C# backend:
- **questions**: Question documents
- **players**: Player documents
- **sessions**: Game session documents

Both backends can share the same database without conflicts.

## Running the Application

### Local Development
1. Ensure MongoDB is running (via Docker)
2. Set environment variables or create .env file
3. Run: `go run main.go`

### Docker
1. Build and run with docker-compose: `docker-compose up backend-go`
2. The service will be available on port 5012

### Testing
- Use the provided test scripts: `test_api.ps1` (PowerShell) or `test_api.sh` (Bash)
- Or test manually with curl/Postman

## Key Differences from C# Backend

1. **Language**: Go vs C#
2. **Framework**: Gin vs ASP.NET Core
3. **Port**: 5012 vs 5012 (same port)
4. **Dependency Injection**: Manual vs built-in DI container
5. **Configuration**: Environment variables vs appsettings.json

## Compatibility Score Calculation

The compatibility score calculation logic is identical to the C# version:
- Only "Yay!" and "I don't care!" answers contribute to the score
- "Nay!" answers are ignored
- Formula: (matching answers / total questions) * 100, rounded to nearest whole number

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:5173` (SvelteKit dev server)
- `http://localhost:4173` (SvelteKit preview server)

## Error Handling

The Go backend provides consistent error responses:
- 400: Bad Request (validation errors)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server errors)

## Performance Considerations

- Uses connection pooling for MongoDB
- Implements graceful shutdown
- Includes health check endpoint for monitoring
- Optimized for concurrent request handling

## Future Enhancements

Potential improvements:
- Add request logging middleware
- Implement rate limiting
- Add metrics collection
- Add unit tests
- Implement caching layer
- Add API documentation (Swagger)
