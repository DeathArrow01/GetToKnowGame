using GetToKnowGame.Models;
using GetToKnowGame.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GetToKnowGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : ControllerBase
    {
        private readonly IPlayerRepository _playerRepository;

        public PlayersController(IPlayerRepository playerRepository)
        {
            _playerRepository = playerRepository;
        }

        [HttpPost]
        public async Task<ActionResult<Player>> CreatePlayer([FromBody] Player player)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(player.Name))
                {
                    return BadRequest("Name is required");
                }

                var createdPlayer = await _playerRepository.CreateAsync(player);
                return CreatedAtAction(nameof(GetPlayer), new { id = createdPlayer.Id }, createdPlayer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Player>> GetPlayer(string id)
        {
            try
            {
                var player = await _playerRepository.GetByIdAsync(id);
                if (player == null)
                {
                    return NotFound();
                }
                return Ok(player);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Player>> UpdatePlayer(string id, [FromBody] Player player)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(player.Name))
                {
                    return BadRequest("Name is required");
                }

                player.Id = id;
                var updatedPlayer = await _playerRepository.UpdateAsync(id, player);
                if (updatedPlayer == null)
                {
                    return NotFound();
                }
                return Ok(updatedPlayer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePlayer(string id)
        {
            try
            {
                var deleted = await _playerRepository.DeleteAsync(id);
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
