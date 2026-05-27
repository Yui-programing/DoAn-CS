using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.UseCases.Auth;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            var token = await _mediator.Send(command);
            return Ok(new { success = true, token });
        }

        [Authorize] // Endpoint này yêu cầu phải có Token hợp lệ
        [HttpGet("test-auth")]
        public IActionResult TestAuth()
        {
            return Ok(new { message = "Bạn đã truy cập thành công API được bảo vệ!" });
        }
    }
}