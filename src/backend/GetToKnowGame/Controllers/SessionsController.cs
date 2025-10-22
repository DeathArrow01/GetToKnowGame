using GetToKnowGame.Models;
using GetToKnowGame.Repositories;
using GetToKnowGame.Services;
using Microsoft.AspNetCore.Mvc;

namespace GetToKnowGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly IGameSessionRepository _sessionRepository;
        private readonly IPlayerRepository _playerRepository;
        private readonly ICompatibilityService _compatibilityService;

        public SessionsController(
            IGameSessionRepository sessionRepository,
            IPlayerRepository playerRepository,
            ICompatibilityService compatibilityService)
        {
            _sessionRepository = sessionRepository;
            _playerRepository = playerRepository;
            _compatibilityService = compatibilityService;
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateSession([FromBody] CreateSessionRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Player1Name) || string.IsNullOrWhiteSpace(request.Player2Name))
                {
                    return BadRequest("Both player names are required");
                }

                // Create Player 1
                var player1 = new Player { Name = request.Player1Name };
                var createdPlayer1 = await _playerRepository.CreateAsync(player1);
                
                Console.WriteLine($"Created Player 1: Id={createdPlayer1.Id}, Name={createdPlayer1.Name}");

                // Create GameSession
                var session = new GameSession
                {
                    Player1Id = createdPlayer1.Id,
                    Player1Answers = new List<PlayerAnswer>(),
                    Player2Name = request.Player2Name
                };
                var createdSession = await _sessionRepository.CreateAsync(session);
                
                Console.WriteLine($"Created Session: Id={createdSession.Id}, Player1Id={createdSession.Player1Id}");

                return Ok(new
                {
                    SessionId = createdSession.Id,
                    Player1Id = createdPlayer1.Id,
                    ShareableUrl = $"/session/{createdSession.Id}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{sessionId}")]
        public async Task<ActionResult<object>> GetSession(string sessionId)
        {
            try
            {
                var session = await _sessionRepository.GetBySessionIdAsync(sessionId);
                if (session == null)
                {
                    return NotFound("Session not found");
                }

                var player1 = await _playerRepository.GetByIdAsync(session.Player1Id);
                Console.WriteLine($"Retrieved Player 1: Id={player1?.Id}, Name={player1?.Name}");
                
                Player? player2 = null;
                if (session.Player2Id != null)
                {
                    player2 = await _playerRepository.GetByIdAsync(session.Player2Id);
                    Console.WriteLine($"Retrieved Player 2: Id={player2?.Id}, Name={player2?.Name}");
                }

                // Determine session state
                var sessionState = new
                {
                    SessionId = session.Id,
                    Player1Id = session.Player1Id,
                    Player1Name = player1?.Name,
                    Player2Id = session.Player2Id,
                    Player2Name = player2?.Name ?? session.Player2Name, // Use stored name if player2 doesn't exist yet
                    IsPlayer2Joined = session.Player2Id != null,
                    IsPlayer2Completed = session.Player2Answers != null,
                    IsGameComplete = session.Player2Answers != null && session.CompatibilityScore.HasValue,
                    CompatibilityScore = session.CompatibilityScore,
                    Player1Answers = session.Player1Answers,
                    Player2Answers = session.Player2Answers
                };

                return Ok(sessionState);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{sessionId}/join")]
        public async Task<ActionResult> JoinSession(string sessionId, [FromBody] JoinSessionRequest request)
        {
            try
            {
                var session = await _sessionRepository.GetBySessionIdAsync(sessionId);
                if (session == null)
                {
                    return NotFound("Session not found");
                }

                if (session.Player2Id != null)
                {
                    return BadRequest("Player 2 has already joined this session");
                }

                if (string.IsNullOrWhiteSpace(request.Player2Name))
                {
                    return BadRequest("Player 2 name is required");
                }

                // Create Player 2
                var player2 = new Player { Name = request.Player2Name };
                var createdPlayer2 = await _playerRepository.CreateAsync(player2);

                // Update session with Player 2 ID and clear the stored name
                await _sessionRepository.SetPlayer2IdAsync(sessionId, createdPlayer2.Id);
                await _sessionRepository.ClearPlayer2NameAsync(sessionId);

                return Ok(new
                {
                    Player2Id = createdPlayer2.Id,
                    Message = "Player 2 joined successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{sessionId}/answers")]
        public async Task<ActionResult> SubmitAnswers(string sessionId, [FromBody] SubmitAnswersRequest request)
        {
            try
            {
                // Add logging for debugging
                Console.WriteLine($"SubmitAnswers called for session: {sessionId}");
                Console.WriteLine($"Request PlayerId: {request.PlayerId}");
                Console.WriteLine($"Request Answers count: {request.Answers?.Count ?? 0}");

                var session = await _sessionRepository.GetBySessionIdAsync(sessionId);
                if (session == null)
                {
                    Console.WriteLine("Session not found");
                    return NotFound("Session not found");
                }

                Console.WriteLine($"Session Player1Id: {session.Player1Id}");
                Console.WriteLine($"Session Player2Id: {session.Player2Id}");

                // Validate that the player ID matches either Player 1 or Player 2
                if (request.PlayerId != session.Player1Id && (session.Player2Id == null || request.PlayerId != session.Player2Id))
                {
                    Console.WriteLine("Player does not belong to this session");
                    return BadRequest("Player does not belong to this session");
                }

                // Validate answers
                if (request.Answers == null || request.Answers.Count == 0)
                {
                    Console.WriteLine("No answers provided");
                    return BadRequest("Answers are required");
                }

                // Update answers
                var updateSuccess = await _sessionRepository.UpdatePlayerAnswersAsync(sessionId, request.PlayerId, request.Answers);
                if (!updateSuccess)
                {
                    Console.WriteLine("Failed to update answers");
                    return StatusCode(500, "Failed to update answers");
                }

                // If this is Player 2's submission, calculate compatibility score
                if (request.PlayerId == session.Player2Id)
                {
                    var updatedSession = await _sessionRepository.GetBySessionIdAsync(sessionId);
                    if (updatedSession?.Player1Answers != null && updatedSession.Player2Answers != null)
                    {
                        var score = _compatibilityService.CalculateScore(updatedSession.Player1Answers, updatedSession.Player2Answers);
                        await _sessionRepository.SetCompatibilityScoreAsync(sessionId, score);
                    }
                }

                return Ok(new { Message = "Answers submitted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{sessionId}")]
        public async Task<ActionResult> DeleteSession(string sessionId)
        {
            try
            {
                var deleted = await _sessionRepository.DeleteAsync(sessionId);
                if (!deleted)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class CreateSessionRequest
    {
        public string Player1Name { get; set; } = string.Empty;
        public string Player2Name { get; set; } = string.Empty;
    }

    public class JoinSessionRequest
    {
        public string Player2Name { get; set; } = string.Empty;
    }

    public class SubmitAnswersRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public List<PlayerAnswer> Answers { get; set; } = new();
    }
}
