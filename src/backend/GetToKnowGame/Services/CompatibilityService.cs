using GetToKnowGame.Models;

namespace GetToKnowGame.Services
{
    public class CompatibilityService : ICompatibilityService
    {
        public int CalculateScore(List<PlayerAnswer> player1Answers, List<PlayerAnswer> player2Answers)
        {
            if (player1Answers.Count != player2Answers.Count)
            {
                throw new ArgumentException("Both players must answer the same number of questions");
            }

            var matches = 0;
            var totalQuestions = player1Answers.Count;

            for (int i = 0; i < totalQuestions; i++)
            {
                var player1Answer = player1Answers[i];
                var player2Answer = player2Answers[i];

                // Find matching question IDs
                var player2MatchingAnswer = player2Answers.FirstOrDefault(a => a.QuestionId == player1Answer.QuestionId);
                if (player2MatchingAnswer == null) continue;

                // Only count matches where both said "Yay!" or "I don't care!"
                if ((player1Answer.Response == ResponseType.Yay || player1Answer.Response == ResponseType.DontCare) &&
                    (player2MatchingAnswer.Response == ResponseType.Yay || player2MatchingAnswer.Response == ResponseType.DontCare) &&
                    player1Answer.Response == player2MatchingAnswer.Response)
                {
                    matches++;
                }
            }

            return (int)Math.Round((double)matches / totalQuestions * 100);
        }
    }
}
