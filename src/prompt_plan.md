Phase 1: Backend Foundation
Prompt 1: Project Setup and MongoDB Configuration
text
Create a .NET 8 WebAPI project with MongoDB integration for the Get to Know Game.

Steps:
1. Create a new .NET 8 WebAPI project named "GetToKnowGame"
2. Add MongoDB.Driver NuGet package
3. Create a docker-compose.yml file in the project root with MongoDB configuration:
   - Image: mongo:latest
   - Container name: get_to_know_mongodb
   - Port: 27017
   - Environment: MONGO_INITDB_ROOT_USERNAME=admin, MONGO_INITDB_ROOT_PASSWORD=password
   - Volume: mongodb_data for persistence
   - Network: app-network
4. Create appsettings.json with MongoDB connection string: "mongodb://admin:password@localhost:27017"
5. Create a MongoDB context class to handle database connection
6. Register MongoDB service in Program.cs

Expected output: A working .NET 8 WebAPI that can connect to MongoDB running in Docker.

Prompt 2: Data Models
text
Create the data models for the Get to Know Game based on the MongoDB collections.

Steps:
1. Create Models/Question.cs with:
   - ObjectId _id
   - string Section
   - string QuestionText

2. Create Models/Player.cs with:
   - ObjectId _id
   - string Name

3. Create Models/PlayerAnswer.cs with:
   - ObjectId QuestionId
   - string Response ("Yay!", "Nay!", "I don't care!")

4. Create Models/GameSession.cs with:
   - ObjectId _id
   - ObjectId Player1Id
   - ObjectId? Player2Id (nullable)
   - List<PlayerAnswer> Player1Answers
   - List<PlayerAnswer>? Player2Answers (nullable)
   - int? CompatibilityScore (nullable)

5. Create enums for response types and other constants

Expected output: Complete data models that match the database structure specification.

Prompt 3: MongoDB Collections and Repository Pattern
text
Implement the repository pattern for MongoDB data access.

Steps:
1. Create Interfaces/IRepository.cs with basic CRUD operations
2. Create Repositories/BaseRepository.cs for common MongoDB operations
3. Create Repositories/QuestionRepository.cs specialized for questions
4. Create Repositories/PlayerRepository.cs specialized for players
5. Create Repositories/GameSessionRepository.cs specialized for game sessions
6. Register all repositories in Program.cs as singletons

Expected output: A clean repository layer that abstracts MongoDB operations.

Prompt 4: Question Management Endpoints
text
Implement the Questions API controller with full CRUD operations.

Steps:
1. Create Controllers/QuestionsController.cs
2. Implement GET /api/questions - returns all questions
3. Implement POST /api/questions - creates new question
4. Implement PUT /api/questions/{id} - updates question
5. Implement DELETE /api/questions/{id} - deletes question
6. Add proper error handling and validation
7. Add CORS support to Program.cs for frontend development

Expected output: Fully functional questions API that can be tested via Swagger/Postman.

Prompt 5: Player Management Endpoints
text
Implement the Players API controller.

Steps:
1. Create Controllers/PlayersController.cs
2. Implement POST /api/players - creates new player and returns ID
3. Implement GET /api/players/{id} - gets player by ID
4. Implement PUT /api/players/{id} - updates player name
5. Implement DELETE /api/players/{id} - deletes player
6. Add proper error handling

Expected output: Player management API for creating and managing player records.

Prompt 6: Game Session Creation Endpoint
text
Implement session creation endpoint that sets up a new game.

Steps:
1. Create Controllers/SessionsController.cs
2. Implement POST /api/sessions with request body: { player1Name: string, player2Name: string }
3. In the endpoint:
   - Create Player 1 document
   - Create GameSession document with Player1Id and empty Player1Answers
   - Return session ID and shareable URL
4. Add validation for required fields

Expected output: API endpoint that creates new game sessions and returns session ID.

Phase 2: Core Game Logic
Prompt 7: Question Answering Endpoint
text
Implement the endpoint for submitting player answers.

Steps:
1. In SessionsController, implement PUT /api/sessions/{sessionId}/answers
2. Request body: { playerId: string, answers: [{ questionId: string, response: string }] }
3. Logic:
   - Validate session exists
   - Validate player belongs to session
   - Store answers in appropriate player field (Player1Answers or Player2Answers)
   - If Player2 submits answers, calculate compatibility score
4. Add validation for answer format and completeness

Expected output: Endpoint that accepts and stores player answers.

Prompt 8: Compatibility Score Calculation
text
Implement the compatibility score calculation logic.

Steps:
1. Create Services/CompatibilityService.cs
2. Implement CalculateScore method that:
   - Takes two lists of PlayerAnswer
   - Compares each question's response
   - Counts matches where both players said "Yay!" or "I don't care!"
   - Returns percentage: (matches / total questions) * 100, rounded
3. Integrate this service into the answer submission endpoint for Player 2
4. Update GameSession with calculated score

Expected output: Accurate compatibility scoring that matches the specification.

Prompt 9: Session Retrieval and State Management
text
Implement session retrieval endpoint with state-based response.

Steps:
1. Implement GET /api/sessions/{sessionId} in SessionsController
2. Logic to determine session state:
   - If Player2Id is null: Player 2 hasn't joined
   - If Player2Answers is null: Player 2 hasn't completed
   - If both answers exist: Game is complete
3. Return appropriate response based on state
4. For complete sessions, include compatibility score and player names

Expected output: Smart session endpoint that provides appropriate data based on game state.

Phase 3: Frontend Foundation
Prompt 10: SvelteKit Project Setup
text
Set up SvelteKit frontend with Tailwind CSS and DaisyUI.

Steps:
1. Create a new SvelteKit project
2. Install and configure Tailwind CSS
3. Install and configure DaisyUI
4. Set up basic layout with app.html structure
5. Create lib/styles/app.css with base styles
6. Create a basic layout.svelte with common page structure
7. Configure package.json scripts for development

Expected output: A working SvelteKit project with Tailwind and DaisyUI ready for component development.

Prompt 11: API Service Layer
text
Create frontend API service layer to communicate with backend.

Steps:
1. Create lib/services/api.js with base API configuration
2. Create lib/services/questionService.js for question API calls
3. Create lib/services/playerService.js for player API calls
4. Create lib/services/sessionService.js for session API calls
5. Implement error handling and response parsing
6. Set up API base URL configuration

Expected output: Complete API service layer that can make all necessary backend calls.

Prompt 12: Shared Components
text
Create reusable UI components for the game.

Steps:
1. Create components/QuestionCard.svelte:
   - Displays section name and question text
   - Three answer buttons: "Yay!", "Nay!", "I don't care!"
   - Emits selected answer

2. Create components/ProgressIndicator.svelte:
   - Shows "Question X of Y"
   - Visual progress bar

3. Create components/LoadingSpinner.svelte:
   - Reusable loading animation

4. Create components/ErrorMessage.svelte:
   - Standardized error display

Expected output: Reusable components that follow the design specification.

Phase 4: Game Flow Implementation
Prompt 13: Home Page and Session Creation
text
Implement the home page where Player 1 starts a new game.

Steps:
1. Create routes/+page.svelte as home page
2. Design form with:
   - Player 1 name input
   - Player 2 name input
   - Submit button
3. On submit:
   - Call session creation API
   - Redirect to completion page with session ID
4. Use Tailwind/DaisyUI for modern, appealing design
5. Add form validation

Expected output: Beautiful home page that allows starting new game sessions.

Prompt 14: Session Completion Page
text
Implement the session completion page for Player 1.

Steps:
1. Create routes/session/[sessionId]/completion/+page.svelte
2. Display:
   - "Thank you for playing!" message
   - Player 2's name in the message
   - Shareable session link
   - "Copy Link" button that copies to clipboard
3. Implement copy to clipboard functionality
4. Style with DaisyUI components

Expected output: Completion page that provides shareable link to Player 2.

Prompt 15: Player 2 Welcome Page
text
Implement Player 2 welcome page.

Steps:
1. Create routes/session/[sessionId]/+page.svelte
2. Logic:
   - Fetch session data on load
   - If Player 2 hasn't joined, show welcome screen
   - Display Player 1's name in welcome message
   - Show "Start Answering" button that begins question flow
3. If Player 2 has already joined, redirect appropriately
4. Create welcoming, engaging design for high school audience

Expected output: Welcome page that greets Player 2 and starts their game.

Prompt 16: Question Answering Interface
text
Implement the question answering flow for both players.

Steps:
1. Create routes/session/[sessionId]/questions/+page.svelte
2. On load:
   - Fetch all questions from API
   - Load current player's progress
3. Implement:
   - QuestionCard component for current question
   - ProgressIndicator showing position
   - "Next" button (changes to "Finish" on last question)
   - Button disabled until answer selected
4. Store answers locally and submit on completion
5. Navigate to appropriate page after completion

Expected output: Smooth question answering experience matching the specification.

Phase 5: Results and Integration
Prompt 17: Results Page Implementation
text
Implement the results display page.

Steps:
1. Create routes/session/[sessionId]/results/+page.svelte
2. On load, fetch session data and calculate shared answers
3. Display:
   - Large compatibility score (0-100%) at top
   - Appropriate emoji based on score range
   - Grouped lists of shared "Yay!" and "I don't care!" answers by section
   - Format: "[Player1] and [Player2] both said Yay! to [Question]"
4. Do not show "Nay!" answers
5. Use card-based layout with DaisyUI components
6. Handle cases where results aren't ready yet

Expected output: Engaging results page that clearly shows compatibility and shared interests.

Prompt 18: State Management and Routing Logic
text
Implement comprehensive state management and routing.

Steps:
1. Create lib/stores/sessionStore.js for managing game state
2. Implement route guards:
   - Redirect to appropriate pages based on session state
   - Prevent access to invalid states
3. Add loading states throughout the app
4. Implement proper error handling for API failures
5. Add 404 page for invalid sessions

Expected output: Robust application with proper state management and user-friendly error handling.

Prompt 19: Database Seeding and Final Integration
text
Add database seeding and final integration touches.

Steps:
1. Create a database seeder that adds sample questions if collection is empty
2. Categories: Food, Entertainment, Lifestyle, Travel
3. Add 3-4 questions per category as specified
4. Test complete game flow:
   - Player 1 creates session
   - Player 1 answers questions
   - Player 2 joins and answers
   - View results
5. Fix any integration issues

Expected output: Fully functional game with sample data ready for testing.

Phase 6: Polish and Testing
Prompt 20: Final Polish and Responsive Design
text
Apply final polish and ensure responsive design.

Steps:
1. Test and fix responsive design on mobile devices
2. Add subtle animations and transitions
3. Improve color scheme and visual appeal for high school audience
4. Add loading states and skeleton screens
5. Verify all copy text matches specification
6. Test copy link functionality
7. Ensure all buttons have proper hover/focus states

Expected output: Polished, engaging web application that meets all design requirements.

Prompt 21: Backend Unit Tests
text
Implement unit tests for backend logic.

Steps:
1. Create xUnit test project
2. Write tests for CompatibilityService score calculation
3. Test edge cases: all matches, no matches, partial matches
4. Write tests for repository methods
5. Add integration tests for API endpoints
6. Ensure test coverage for critical business logic

Expected output: Comprehensive test suite for backend functionality.

Prompt 22: Documentation and Final Review
text
Create documentation and perform final review.

Steps:
1. Add README.md with setup instructions
2. Document API endpoints
3. Verify all functional requirements are met
4. Test complete user journey
5. Check MongoDB persistence
6. Ensure Docker setup works correctly
7. Final code cleanup and comments

Expected output: Well-documented, production-ready application.