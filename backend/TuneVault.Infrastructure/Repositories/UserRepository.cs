using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IDbConnection _dbConnection;

        public UserRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<IEnumerable<UserProfile>> GetAllAsync()
        {
            string sql = "SELECT * FROM UserProfile";
            return await _dbConnection.QueryAsync<UserProfile>(sql);
        }
    }
}