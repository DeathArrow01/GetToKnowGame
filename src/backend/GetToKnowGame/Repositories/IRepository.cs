using System.Linq.Expressions;

namespace GetToKnowGame.Repositories
{
    public interface IRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(string id);
        Task<T> CreateAsync(T entity);
        Task<T?> UpdateAsync(string id, T entity);
        Task<bool> DeleteAsync(string id);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> filter);
    }
}
