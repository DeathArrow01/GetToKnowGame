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

                // Create GameSession
                var session = new GameSession
                {
                    Player1Id = createdPlayer1.Id,
                    Player1Answers = new List<PlayerAnswer>()
                };
                var createdSession = await _sessionRepository.CreateAsync(session);

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
                Player? player2 = null;
                if (session.Player2Id != null)
                {
                    player2 = await _playerRepository.GetByIdAsync(session.Player2Id);
                }

                // Determine session state
                var sessionState = new
                {
                    SessionId = session.Id,
                    Player1Name = player1?.Name,
                    Player2Name = player2?.Name,
                    Player2Id = session.Player2Id,
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

        [HttpPut("{sessionId}/answers")]
        public async Task<ActionResult> SubmitAnswers(string sessionId, [FromBody] SubmitAnswersRequest request)
        {
            try
            {
                var session = await _sessionRepository.GetBySessionIdAsync(sessionId);
                if (session == null)
                {
                    return NotFound("Session not found");
                }

                // Validate player belongs to session
                if (request.PlayerId != session.Player1Id && request.PlayerId != session.Player2Id)
                {
                    return BadRequest("Player does not belong to this session");
                }

                // If this is Player 2's first submission, create Player 2
                if (request.PlayerId == session.Player1Id && session.Player2Id == null)
                {
                    return BadRequest("Player 1 cannot submit answers again");
                }

                if (request.PlayerId != session.Player1Id && session.Player2Id == null)
                {
                    // This is Player 2 joining - we need to create them first
                    // For now, we'll assume Player 2 name is provided in the request
                    // In a real app, you might want to handle this differently
                    return BadRequest("Player 2 must be created first");
                }

                // Update answers
                var success = await _sessionRepository.UpdatePlayerAnswersAsync(sessionId, request.PlayerId, request.Answers);
                if (!success)
                {
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

    public class SubmitAnswersRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public List<PlayerAnswer> Answers { get; set; } = new();
    }
}
