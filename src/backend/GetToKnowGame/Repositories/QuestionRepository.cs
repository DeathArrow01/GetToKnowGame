using GetToKnowGame.Models;
using MongoDB.Driver;

namespace GetToKnowGame.Repositories
{
    public class QuestionRepository : BaseRepository<Question>, IQuestionRepository
    {
        public QuestionRepository(IMongoDatabase database) : base(database, "questions")
        {
        }

        public async Task<IEnumerable<Question>> GetBySectionAsync(string section)
        {
            var filter = Builders<Question>.Filter.Eq(q => q.Section, section);
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<IEnumerable<string>> GetSectionsAsync()
        {
            var sections = await _collection.Distinct<string>("section", FilterDefinition<Question>.Empty).ToListAsync();
            return sections;
        }
    }
}
