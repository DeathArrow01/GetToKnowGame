using GetToKnowGame.Models;

namespace GetToKnowGame.Repositories
{
    public interface IGameSessionRepository : IRepository<GameSession>
    {
        Task<GameSession?> GetBySessionIdAsync(string sessionId);
        Task<bool> UpdatePlayerAnswersAsync(string sessionId, string playerId, List<PlayerAnswer> answers);
        Task<bool> SetCompatibilityScoreAsync(string sessionId, int score);
        Task<bool> SetPlayer2IdAsync(string sessionId, string player2Id);
        Task<bool> ClearPlayer2NameAsync(string sessionId);
    }
}
