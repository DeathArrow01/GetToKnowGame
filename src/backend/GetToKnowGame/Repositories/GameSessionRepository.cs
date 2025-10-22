using GetToKnowGame.Models;
using MongoDB.Driver;

namespace GetToKnowGame.Repositories
{
    public class GameSessionRepository : BaseRepository<GameSession>, IGameSessionRepository
    {
        public GameSessionRepository(IMongoDatabase database) : base(database, "sessions")
        {
        }

        public async Task<GameSession?> GetBySessionIdAsync(string sessionId)
        {
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdatePlayerAnswersAsync(string sessionId, string playerId, List<PlayerAnswer> answers)
        {
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            
            UpdateDefinition<GameSession> update;
            if (playerId == (await GetBySessionIdAsync(sessionId))?.Player1Id)
            {
                update = Builders<GameSession>.Update.Set(s => s.Player1Answers, answers);
            }
            else
            {
                update = Builders<GameSession>.Update.Set(s => s.Player2Answers, answers);
            }

            var result = await _collection.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> SetCompatibilityScoreAsync(string sessionId, int score)
        {
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            var update = Builders<GameSession>.Update.Set(s => s.CompatibilityScore, score);
            
            var result = await _collection.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }
    }
}
