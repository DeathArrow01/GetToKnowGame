using GetToKnowGame.Models;
using GetToKnowGame.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GetToKnowGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionRepository _questionRepository;

        public QuestionsController(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Question>>> GetQuestions()
        {
            try
            {
                var questions = await _questionRepository.GetAllAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Question>> GetQuestion(string id)
        {
            try
            {
                var question = await _questionRepository.GetByIdAsync(id);
                if (question == null)
                {
                    return NotFound();
                }
                return Ok(question);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Question>> CreateQuestion([FromBody] Question question)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(question.Section) || string.IsNullOrWhiteSpace(question.QuestionText))
                {
                    return BadRequest("Section and QuestionText are required");
                }

                var createdQuestion = await _questionRepository.CreateAsync(question);
                return CreatedAtAction(nameof(GetQuestion), new { id = createdQuestion.Id }, createdQuestion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Question>> UpdateQuestion(string id, [FromBody] Question question)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(question.Section) || string.IsNullOrWhiteSpace(question.QuestionText))
                {
                    return BadRequest("Section and QuestionText are required");
                }

                question.Id = id;
                var updatedQuestion = await _questionRepository.UpdateAsync(id, question);
                if (updatedQuestion == null)
                {
                    return NotFound();
                }
                return Ok(updatedQuestion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteQuestion(string id)
        {
            try
            {
                var deleted = await _questionRepository.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
