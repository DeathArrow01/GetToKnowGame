using MongoDB.Driver;

namespace GetToKnowGame.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MongoDB") ?? 
                                 configuration["MongoDB:ConnectionString"];
            var databaseName = configuration["MongoDB:DatabaseName"] ?? "GetToKnowGame";
            
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string collectionName)
        {
            return _database.GetCollection<T>(collectionName);
        }

        public IMongoDatabase Database => _database;
    }
}
