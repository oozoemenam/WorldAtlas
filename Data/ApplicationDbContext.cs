using Microsoft.EntityFrameworkCore;
using WorldAtlas.Data.Models;

namespace WorldAtlas.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext() : base() { }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { } 

        public DbSet<City> Cities => Set<City>();

        public DbSet<Country> Countries => Set<Country>();  
    }
}
