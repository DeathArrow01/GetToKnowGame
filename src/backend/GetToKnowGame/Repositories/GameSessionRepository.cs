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
            Console.WriteLine($"GameSessionRepository.GetBySessionIdAsync called with sessionId: '{sessionId}'");
            
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            var result = await _collection.Find(filter).FirstOrDefaultAsync();
            
            Console.WriteLine($"GameSessionRepository.GetBySessionIdAsync result: Id='{result?.Id}', Player1Id='{result?.Player1Id}', Player2Id='{result?.Player2Id}'");
            
            return result;
        }

        public async Task<bool> UpdatePlayerAnswersAsync(string sessionId, string playerId, List<PlayerAnswer> answers)
        {
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            
            // Get the session to determine which player this is
            var session = await GetBySessionIdAsync(sessionId);
            if (session == null)
            {
                return false;
            }
            
            UpdateDefinition<GameSession> update;
            if (playerId == session.Player1Id)
            {
                update = Builders<GameSession>.Update.Set(s => s.Player1Answers, answers);
            }
            else if (playerId == session.Player2Id)
            {
                update = Builders<GameSession>.Update.Set(s => s.Player2Answers, answers);
            }
            else
            {
                return false; // Player doesn't belong to this session
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

        public async Task<bool> SetPlayer2IdAsync(string sessionId, string player2Id)
        {
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            var update = Builders<GameSession>.Update.Set(s => s.Player2Id, player2Id);
            
            var result = await _collection.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> ClearPlayer2NameAsync(string sessionId)
        {
            var filter = Builders<GameSession>.Filter.Eq(s => s.Id, sessionId);
            var update = Builders<GameSession>.Update.Unset(s => s.Player2Name);
            
            var result = await _collection.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }
    }
}
