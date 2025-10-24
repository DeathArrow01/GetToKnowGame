# Get to Know Game - Go Backend

This is the Go implementation of the Get to Know Game backend API, providing the same functionality as the C# version.

## Prerequisites

- Go 1.21 or higher
- MongoDB (running via Docker)

## Configuration

The application uses environment variables for configuration. You can set these in your environment or create a `.env` file:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017
DATABASE_NAME=GetToKnowGame

# Server Configuration
PORT=5012

# Environment
GIN_MODE=debug
```

## Installation

1. Install dependencies:
```bash
go mod tidy
```

2. Start MongoDB (if not already running):
```bash
docker-compose up -d mongodb
```

3. Run the application:
```bash
go run main.go
```

The server will start on port 5012 by default.

## API Endpoints

The Go backend provides the same API endpoints as the C# version:

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

## Database

The application automatically seeds the database with sample questions on startup if the questions collection is empty.

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (SvelteKit dev server)
- `http://localhost:4173` (SvelteKit preview server)

## Development

To run in development mode:
```bash
GIN_MODE=debug go run main.go
```

To build for production:
```bash
go build -o get-to-know-game-go main.go
```
