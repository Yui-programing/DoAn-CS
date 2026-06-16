using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace TuneVault.API.Requests
{
    public class SubmitArtistRegistrationRequest
    {
        [Required]
        public string StageName { get; set; } = null!;

        public string? Genres { get; set; }

        [Required]
        public IFormFile IdCard { get; set; } = null!;
    }
}
