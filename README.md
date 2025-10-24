# Get to Know Game

A 2-player web game that helps high school students discover shared interests and calculate compatibility scores based on their answers to predefined questions.

## Features

- **2-Player Game Flow**: Player 1 creates a session, answers questions, and shares a link with Player 2
- **Question Answering**: Players answer questions with "Yay!", "Nay!", or "I don't care!" responses
- **Compatibility Scoring**: Calculates compatibility based on matching positive responses
- **Results Display**: Shows compatibility score with emoji and shared interests grouped by category
- **Modern UI**: Built with SvelteKit, Tailwind CSS, and DaisyUI for an engaging experience

## Tech Stack

### Backend
- **Primary**: .NET 8 WebAPI
- **Alternative**: Go with Fiber framework (optional)
- MongoDB with official driver
- Repository pattern for data access
- RESTful API design
- xUnit testing framework (for .NET)
- Solution structure with separate test project

### Frontend
- SvelteKit
- Tailwind CSS
- DaisyUI components
- TypeScript support

### Database
- MongoDB running in Docker container
- Collections: questions, players, sessions

## Project Structure

```
src/
├── backend/
│   ├── GetToKnowGame.sln              # .NET Solution file
│   ├── GetToKnowGame/                 # .NET API project
│   │   ├── Controllers/               # API controllers
│   │   ├── Models/                    # Data models
│   │   ├── Repositories/              # Data access layer
│   │   ├── Services/                  # Business logic
│   │   └── Data/                      # Database context
│   ├── GetToKnowGame.Tests/           # .NET Unit and integration tests
│   └── get-to-know-game-go/           # Go backend (optional)
│       ├── handlers/                  # HTTP handlers
│       ├── models/                    # Data models
│       ├── repositories/              # Data access layer
│       ├── services/                  # Business logic
│       └── main.go                    # Application entry point
├── frontend/
│   └── get-to-know-game/              # SvelteKit frontend
│       ├── src/
│       │   ├── routes/                # Page routes
│       │   ├── lib/
│       │   │   ├── components/        # Reusable components
│       │   │   └── services/          # API services
│       │   └── app.html               # App template
│       └── package.json
├── docker-compose.yml                 # MongoDB container
└── README.md
```

## Getting Started

### Prerequisites
- .NET 8 SDK (for .NET backend)
- Go 1.21+ (for Go backend - optional)
- Node.js (for frontend development)
- Docker Desktop (for MongoDB)

### Backend Setup

You can choose between two backend implementations:

#### Option 1: .NET Backend (Primary)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Start MongoDB using Docker:
   ```bash
   docker-compose up -d
   ```

4. Run the .NET backend:
   ```bash
   dotnet run --project GetToKnowGame
   ```

5. Run tests:
   ```bash
   dotnet test
   ```

The .NET API will be available at `https://localhost:5000` (or `http://localhost:5000`)

#### Option 2: Go Backend (Alternative)

1. Navigate to the Go backend directory:
   ```bash
   cd backend/get-to-know-game-go
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Start MongoDB using Docker:
   ```bash
   docker-compose up -d
   ```

4. Run the Go backend:
   ```bash
   go run main.go
   # or use the pre-built executable:
   # ./get-to-know-game-go.exe
   ```

The Go API will be available at `http://localhost:5012`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/get-to-know-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create a new question
- `PUT /api/questions/{id}` - Update a question
- `DELETE /api/questions/{id}` - Delete a question

### Players
- `POST /api/players` - Create a new player
- `GET /api/players/{id}` - Get player by ID
- `PUT /api/players/{id}` - Update player
- `DELETE /api/players/{id}` - Delete player

### Sessions
- `POST /api/sessions` - Create a new game session
- `GET /api/sessions/{sessionId}` - Get session details
- `PUT /api/sessions/{sessionId}/answers` - Submit player answers
- `DELETE /api/sessions/{sessionId}` - Delete session

## Game Flow

1. **Player 1** creates a session by entering both player names
2. **Player 1** answers all questions one by one
3. **Player 1** receives a shareable link to send to Player 2
4. **Player 2** accesses the link and sees a welcome screen
5. **Player 2** answers the same questions
6. **Both players** can view the results showing compatibility score and shared interests

## Compatibility Scoring

The compatibility score is calculated as:
- Only matching "Yay!" or "I don't care!" answers count
- Formula: (matching answers / total questions) × 100
- Score ranges with emojis:
  - 80-100%: ❤️
  - 50-79%: 🙂
  - 20-49%: 😬
  - <20%: 💀

## Sample Questions

The game includes questions in four categories:
- **Food**: Pizza Diavola, Sushi, Pineapple on pizza
- **Entertainment**: Marvel movies, Anime, TikTok
- **Lifestyle**: Night owl, Gym, Reading books
- **Travel**: Beach holidays, Camping, Visiting museums

## Development

### Backend Development
- Uses repository pattern for clean data access
- Services handle business logic (e.g., compatibility calculation)
- MongoDB integration with official driver
- Swagger documentation available at `/swagger`

### Frontend Development
- SvelteKit with file-based routing
- Tailwind CSS for styling
- DaisyUI for component library
- TypeScript for type safety

## Docker Configuration

The MongoDB container is configured with:
- Image: `mongo:latest`
- Port: `27017`
- Username: `admin`
- Password: `password`
- Database: `GetToKnowGame`
- Persistent volume for data

## Quick Start:
	
	### Start database:
	$ cd src
	$ docker-compose up -d
	
	### Choose one backend option:
	
	#### Option 1: Start .NET Backend (Primary): 
	$ cd backend && dotnet run --project GetToKnowGame
	# App runs at: https://localhost:7169
	# Swagger docs: https://localhost:7169/swagger
	
	#### Option 2: Start Go Backend (Alternative):
	$ cd backend/get-to-know-game-go && .\get-to-know-game-go.exe
	# App runs at: http://localhost:5012
	
	### Start Frontend: 
	$ cd frontend/get-to-know-game && npm install && npm run dev
	# Frontend runs at: http://localhost:5173
	
### Note: Both backends provide the same API endpoints and functionality. Choose the one you prefer!


## License

This project is for educational purposes.
