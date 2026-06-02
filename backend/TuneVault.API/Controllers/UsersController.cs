using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TuneVault.Application.Features.Users.Queries;
using TuneVault.Domain.Entities;
using TuneVault.Application.Common;
namespace TuneVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var query = new GetAllUsersQuery();
            var users = await _mediator.Send(query);
            var response = ApiResponseDto<IEnumerable<UserProfile>>.Ok(users, "Lấy danh sách người dùng thành công");
            return Ok(response);
        }
    }
}