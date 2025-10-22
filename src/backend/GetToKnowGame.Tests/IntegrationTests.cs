using GetToKnowGame.Models;
using GetToKnowGame.Services;
using Xunit;

namespace GetToKnowGame.Tests
{
    public class IntegrationTests
    {
        [Fact]
        public void GameFlow_CompleteScenario_CalculatesCorrectScore()
        {
            // Arrange - Simulate a complete game flow
            var compatibilityService = new CompatibilityService();
            
            // Player 1 answers
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },      // Food: Pizza Diavola
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Yay },      // Food: Sushi
                new PlayerAnswer { QuestionId = "3", Response = ResponseType.Nay },      // Food: Pineapple on pizza
                new PlayerAnswer { QuestionId = "4", Response = ResponseType.Yay },      // Entertainment: Marvel movies
                new PlayerAnswer { QuestionId = "5", Response = ResponseType.DontCare }, // Entertainment: Anime
                new PlayerAnswer { QuestionId = "6", Response = ResponseType.Nay },      // Entertainment: TikTok
                new PlayerAnswer { QuestionId = "7", Response = ResponseType.Yay },      // Lifestyle: Night owl
                new PlayerAnswer { QuestionId = "8", Response = ResponseType.Nay },      // Lifestyle: Gym
                new PlayerAnswer { QuestionId = "9", Response = ResponseType.Yay },      // Lifestyle: Reading books
                new PlayerAnswer { QuestionId = "10", Response = ResponseType.Yay },     // Travel: Beach holidays
                new PlayerAnswer { QuestionId = "11", Response = ResponseType.Nay },     // Travel: Camping
                new PlayerAnswer { QuestionId = "12", Response = ResponseType.DontCare } // Travel: Visiting museums
            };

            // Player 2 answers (some matches, some differences)
            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },      // Match: Pizza Diavola
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Nay },      // No match: Sushi
                new PlayerAnswer { QuestionId = "3", Response = ResponseType.Nay },      // Both Nay (doesn't count)
                new PlayerAnswer { QuestionId = "4", Response = ResponseType.Yay },      // Match: Marvel movies
                new PlayerAnswer { QuestionId = "5", Response = ResponseType.DontCare }, // Match: Anime
                new PlayerAnswer { QuestionId = "6", Response = ResponseType.Yay },      // No match: TikTok
                new PlayerAnswer { QuestionId = "7", Response = ResponseType.Yay },      // Match: Night owl
                new PlayerAnswer { QuestionId = "8", Response = ResponseType.Yay },      // No match: Gym
                new PlayerAnswer { QuestionId = "9", Response = ResponseType.Yay },      // Match: Reading books
                new PlayerAnswer { QuestionId = "10", Response = ResponseType.DontCare }, // No match: Beach holidays
                new PlayerAnswer { QuestionId = "11", Response = ResponseType.Nay },     // Both Nay (doesn't count)
                new PlayerAnswer { QuestionId = "12", Response = ResponseType.DontCare } // Match: Visiting museums
            };

            // Act
            var score = compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            // Expected matches: Pizza Diavola (Yay), Marvel movies (Yay), Anime (I don't care), 
            // Night owl (Yay), Reading books (Yay), Visiting museums (I don't care) = 6 matches
            // Total questions: 12
            // Score: (6/12) * 100 = 50%
            Assert.Equal(50, score);
        }

        [Fact]
        public void GameFlow_AllMatchingAnswers_Returns100Percent()
        {
            // Arrange
            var compatibilityService = new CompatibilityService();
            var questions = new List<string> { "1", "2", "3", "4", "5" };
            
            var player1Answers = questions.Select(q => new PlayerAnswer 
            { 
                QuestionId = q, 
                Response = ResponseType.Yay 
            }).ToList();
            
            var player2Answers = questions.Select(q => new PlayerAnswer 
            { 
                QuestionId = q, 
                Response = ResponseType.Yay 
            }).ToList();

            // Act
            var score = compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            Assert.Equal(100, score);
        }

        [Fact]
        public void GameFlow_NoMatchingAnswers_Returns0Percent()
        {
            // Arrange
            var compatibilityService = new CompatibilityService();
            var questions = new List<string> { "1", "2", "3" };
            
            var player1Answers = questions.Select(q => new PlayerAnswer 
            { 
                QuestionId = q, 
                Response = ResponseType.Yay 
            }).ToList();
            
            var player2Answers = questions.Select(q => new PlayerAnswer 
            { 
                QuestionId = q, 
                Response = ResponseType.Nay 
            }).ToList();

            // Act
            var score = compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            Assert.Equal(0, score);
        }
    }
}
