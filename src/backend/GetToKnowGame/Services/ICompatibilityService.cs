using GetToKnowGame.Models;

namespace GetToKnowGame.Services
{
    public interface ICompatibilityService
    {
        int CalculateScore(List<PlayerAnswer> player1Answers, List<PlayerAnswer> player2Answers);
    }
}
