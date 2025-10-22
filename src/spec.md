Get to Know Game Specification
Overview
The "Get to Know Game" is a 2-player web game targeted at high school students, designed to help players discover shared interests and calculate a compatibility score based on their answers to predefined questions. The game is built with a SvelteKit frontend using Tailwind and DaisyUI/Flowbite for styling, and a .NET WebAPI backend with MongoDB for persistence, running locally in a Docker container.
Functional Requirements
Game Flow

Session Creation (Player 1):

Player 1 initiates a new game session by entering their name and Player 2’s name.
A new player document is created for Player 1 with a MongoDB ObjectId and their name.
Player 1 answers a set of predefined questions, one at a time, selecting "Yay!", "Nay!", or "I don’t care!" for each.
Questions are presented one at a time with a "Next" button (changes to "Finish" on the last question), which is inactive until an answer is selected.
A progress indicator shows the current question (e.g., "Question 3 of 12").
After answering all questions, Player 1 receives a shareable session link (/session/{sessionId}) on a completion page with a message: "Thank you for playing! Now it’s time for [Player 2’s Name] to answer. Please copy the session ID and share it." Includes a link and a "Copy Link" button.
The session is stored in MongoDB and persists indefinitely.


Player 2 Participation:

Player 2 accesses the session link and sees a welcome screen: "Hi! [Player 1's Name] has started a game for you. Start answering and enjoy!"
A new player document is created for Player 2 with a MongoDB ObjectId and their pre-entered name (no need to input name again).
Player 2 answers the same questions as Player 1, one at a time, with the same navigation and validation rules.
After answering, the system calculates and stores the compatibility score.


Result Display:

Either player can access the session link after both have answered to view the results.
If accessed before Player 2 completes, it should handle appropriately (e.g., show a waiting message for Player 1 or prompt Player 2 to start).
The result page shows:

Compatibility score (0–100%) prominently at the top with an emoji:

❤️ 80–100%
🙂 50–79%
😬 20–49%
💀 <20%


Lists of shared "Yay!" and "I don’t care!" answers, grouped by section, showing both players’ names, the question text, and the shared response (e.g., "[Player 1] and [Player 2] both said Yay! to Pizza Diavola").
"Nay!" answers are not shown.





Compatibility Score Calculation

Formula: (number of same answers that are Yay or I don’t care) / total number of questions * 100, rounded to the nearest whole number.
Only matching "Yay!" or "I don’t care!" answers contribute to the score. No weighting or skipping allowed; all questions must be answered.

Technical Requirements
Frontend (SvelteKit, Tailwind, DaisyUI/Flowbite)

Question Interface:

Questions presented in a card layout with centered text for section name and question text.
Modern and stylish design using Tailwind and DaisyUI/Flowbite components.
Answer options ("Yay!", "Nay!", "I don’t care!") as buttons or radio buttons with uniform styling.
"Next"/"Finish" button inactive until selection made; no "Previous" button.
Progress indicator included.
No skipping questions; validation enforces a choice per question.


Session Creation:

Form for Player 1 to input both names.
Completion page with thank-you message, shareable link, and copy button.


Player 2 Welcome:

Simple welcome screen with instructions and start button leading to first question.


Result Page:

Score at top with emoji.
Grouped lists (by section) for shared answers in a card-based layout.
Use Tailwind and DaisyUI/Flowbite for modern styling.


General:

Handle API interactions for fetching questions, submitting answers, and retrieving results.
Use SvelteKit routing for pages like home, session creation, question answering, and results.



Backend (.NET WebAPI with MongoDB)

Architecture:

Use controllers, services, and repositories pattern.
Connect to MongoDB using official drivers.
RESTful API design with endpoints for CRUD operations on resources.
No authentication, validation, or session expiration for now.


Database Structure:

Database: Use a single database (e.g., "GetToKnowGame").
Questions Collection (e.g., "questions"):

Fields: _id (MongoDB ObjectId), section (string, e.g., "Food"), questionText (string, e.g., "Pizza Diavola").
Answers ("Yay!", "Nay!", "I don’t care!") are hardcoded in code, not stored here.


Players Collection (e.g., "players"):

Fields: _id (MongoDB ObjectId), name (string).
New documents created per player per session (no reuse).


Sessions Collection (e.g., "sessions"):

Fields:

_id (MongoDB ObjectId, used as sessionId).
player1Id (ObjectId, references players).
player2Id (ObjectId, references players, null until Player 2 joins).
player1Answers (array of { questionId: ObjectId, response: string }).
player2Answers (array of { questionId: ObjectId, response: string }, null until submitted).
compatibilityScore (number, null until calculated).


Persist indefinitely.




RESTful API Endpoints:

Questions:

GET /api/questions: Fetch all questions (grouped by section if needed).
POST /api/questions: Create new question (body: { section, questionText }).
PUT /api/questions/{id}: Update question (body: { section, questionText }).
DELETE /api/questions/{id}: Delete question.


Players:

POST /api/players: Create player (body: { name }, returns _id).
GET /api/players/{id}: Fetch player by ID.
PUT /api/players/{id}: Update name.
DELETE /api/players/{id}: Delete player.


Sessions:

POST /api/sessions: Create session (body: { player1Name, player2Name }, creates players, returns sessionId and link).
GET /api/sessions/{sessionId}: Fetch session (includes player names, answers if complete, score if calculated; determines view based on state).
PUT /api/sessions/{sessionId}/answers: Submit answers (body: { playerId, answers: [{ questionId, response }] }; if Player 2, calculate score).
DELETE /api/sessions/{sessionId}: Delete session.




Data Handling:

Fetch questions from DB on demand.
Store answers as arrays mapping question IDs to responses.
On Player 2 submission, compute score and update session document.
Use MongoDB ObjectId for all IDs.
Handle cases like incomplete sessions gracefully (e.g., via GET endpoint logic).


MongoDB Setup:

Run locally via Docker.
Configuration: Standard port 27017, username "admin", simple password "password" for local dev.
Use volumes for persistence.
Network: Bridge for app connectivity.



Sample Question Sections

Food: Pizza Diavola, Sushi, Pineapple on pizza.
Entertainment: Marvel movies, Anime, TikTok.
Lifestyle: Night owl, Gym, Reading books.
Travel: Beach holidays, Camping, Visiting museums.
Questions fetched from "questions" collection; seed initially if needed.

Docker Configuration
Use the following docker-compose.yml for local setup:
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: get_to_know_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    networks:
      - app-network

volumes:
  mongodb_data:
    driver: local

networks:
  app-network:
    driver: bridge
	
Non-Functional Requirements

Target Audience: High school kids – UI engaging, intuitive, colorful.
Performance: Handle small-scale use; optimize queries for quick responses.
Security: None for now; add later if needed.
Scalability: Local dev focus; MongoDB/.NET support future scaling.
Testing: Implement unit tests for backend logic (e.g., score calculation); frontend tests for flows.
Deployment: Local via Docker; potential for cloud later.

Implementation Notes

Seed questions collection with samples on startup if empty.
Ensure frontend handles API errors gracefully (e.g., invalid session).
Use repositories for DB access in .NET for abstraction.
No in-memory storage; all in MongoDB.
For results, query and aggregate shared answers on-the-fly or store precomputed lists if performance needs.