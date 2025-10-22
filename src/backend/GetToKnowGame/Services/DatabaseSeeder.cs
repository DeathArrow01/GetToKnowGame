using GetToKnowGame.Models;
using GetToKnowGame.Repositories;

namespace GetToKnowGame.Services
{
    public class DatabaseSeeder
    {
        private readonly IQuestionRepository _questionRepository;

        public DatabaseSeeder(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
        }

        public async Task SeedQuestionsAsync()
        {
            var existingQuestions = await _questionRepository.GetAllAsync();
            if (existingQuestions.Any())
            {
                return; // Already seeded
            }

            var questions = new List<Question>
            {
                // Food Section
                new Question { Section = "Food", QuestionText = "Pizza Diavola" },
                new Question { Section = "Food", QuestionText = "Sushi" },
                new Question { Section = "Food", QuestionText = "Pineapple on pizza" },
                
                // Entertainment Section
                new Question { Section = "Entertainment", QuestionText = "Marvel movies" },
                new Question { Section = "Entertainment", QuestionText = "Anime" },
                new Question { Section = "Entertainment", QuestionText = "TikTok" },
                
                // Lifestyle Section
                new Question { Section = "Lifestyle", QuestionText = "Night owl" },
                new Question { Section = "Lifestyle", QuestionText = "Gym" },
                new Question { Section = "Lifestyle", QuestionText = "Reading books" },
                
                // Travel Section
                new Question { Section = "Travel", QuestionText = "Beach holidays" },
                new Question { Section = "Travel", QuestionText = "Camping" },
                new Question { Section = "Travel", QuestionText = "Visiting museums" }
            };

            foreach (var question in questions)
            {
                await _questionRepository.CreateAsync(question);
            }
        }
    }
}
