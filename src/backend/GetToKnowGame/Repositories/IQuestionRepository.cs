using GetToKnowGame.Models;

namespace GetToKnowGame.Repositories
{
    public interface IQuestionRepository : IRepository<Question>
    {
        Task<IEnumerable<Question>> GetBySectionAsync(string section);
        Task<IEnumerable<string>> GetSectionsAsync();
    }
}
