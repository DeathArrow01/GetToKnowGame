using GetToKnowGame.Models;
using MongoDB.Driver;

namespace GetToKnowGame.Repositories
{
    public class PlayerRepository : BaseRepository<Player>, IPlayerRepository
    {
        public PlayerRepository(IMongoDatabase database) : base(database, "players")
        {
        }
    }
}
