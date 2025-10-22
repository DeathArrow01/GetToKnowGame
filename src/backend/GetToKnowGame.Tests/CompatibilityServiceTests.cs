using GetToKnowGame.Models;
using GetToKnowGame.Services;
using Xunit;

namespace GetToKnowGame.Tests
{
    public class CompatibilityServiceTests
    {
        private readonly CompatibilityService _compatibilityService;

        public CompatibilityServiceTests()
        {
            _compatibilityService = new CompatibilityService();
        }

        [Fact]
        public void CalculateScore_AllMatchingYayAnswers_Returns100()
        {
            // Arrange
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "3", Response = ResponseType.Yay }
            };

            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "3", Response = ResponseType.Yay }
            };

            // Act
            var score = _compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            Assert.Equal(100, score);
        }

        [Fact]
        public void CalculateScore_AllMatchingDontCareAnswers_Returns100()
        {
            // Arrange
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.DontCare },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.DontCare }
            };

            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.DontCare },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.DontCare }
            };

            // Act
            var score = _compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            Assert.Equal(100, score);
        }

        [Fact]
        public void CalculateScore_NoMatchingAnswers_Returns0()
        {
            // Arrange
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.DontCare }
            };

            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Nay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Nay }
            };

            // Act
            var score = _compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            Assert.Equal(0, score);
        }

        [Fact]
        public void CalculateScore_MixedAnswers_ReturnsCorrectPercentage()
        {
            // Arrange
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "3", Response = ResponseType.DontCare },
                new PlayerAnswer { QuestionId = "4", Response = ResponseType.Nay }
            };

            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Nay },
                new PlayerAnswer { QuestionId = "3", Response = ResponseType.DontCare },
                new PlayerAnswer { QuestionId = "4", Response = ResponseType.Nay }
            };

            // Act
            var score = _compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            // Should match on questions 1 and 3 (2 out of 4 = 50%)
            Assert.Equal(50, score);
        }

        [Fact]
        public void CalculateScore_NayAnswersDoNotCount_ReturnsCorrectPercentage()
        {
            // Arrange
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Nay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Nay }
            };

            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Nay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Nay }
            };

            // Act
            var score = _compatibilityService.CalculateScore(player1Answers, player2Answers);

            // Assert
            // Nay answers don't count, so should be 0%
            Assert.Equal(0, score);
        }

        [Fact]
        public void CalculateScore_DifferentNumberOfAnswers_ThrowsException()
        {
            // Arrange
            var player1Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay }
            };

            var player2Answers = new List<PlayerAnswer>
            {
                new PlayerAnswer { QuestionId = "1", Response = ResponseType.Yay },
                new PlayerAnswer { QuestionId = "2", Response = ResponseType.Yay }
            };

            // Act & Assert
            Assert.Throws<ArgumentException>(() => 
                _compatibilityService.CalculateScore(player1Answers, player2Answers));
        }
    }
}
