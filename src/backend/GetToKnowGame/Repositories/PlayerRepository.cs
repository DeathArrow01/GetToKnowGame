using GetToKnowGame.Models;
using MongoDB.Driver;
using MongoDB.Bson;

namespace GetToKnowGame.Repositories
{
    public class PlayerRepository : BaseRepository<Player>, IPlayerRepository
    {
        public PlayerRepository(IMongoDatabase database) : base(database, "players")
        {
        }

        public override async Task<Player?> GetByIdAsync(string id)
        {
            Console.WriteLine($"PlayerRepository.GetByIdAsync called with id: '{id}'");
            
            if (string.IsNullOrEmpty(id) || !ObjectId.TryParse(id, out var objectId))
            {
                Console.WriteLine($"Invalid id: '{id}'");
                return null;
            }

            var filter = Builders<Player>.Filter.Eq(p => p.Id, id);
            var result = await _collection.Find(filter).FirstOrDefaultAsync();
            
            Console.WriteLine($"PlayerRepository.GetByIdAsync result: Id='{result?.Id}', Name='{result?.Name}'");
            
            return result;
        }
    }
}
