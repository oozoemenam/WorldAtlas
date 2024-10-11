using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorldAtlas.Data.Models
{
    [Table("Cities")]
    [Index(nameof(Name))]
    [Index(nameof(Longitude))]
    [Index(nameof(Latitude))]
    public class City
    {
        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(7, 4)")]
        public decimal Longitude { get; set; }

        [Column(TypeName = "decimal(7, 4)")]
        public decimal Latitude { get; set; }

        [ForeignKey(nameof(Country))]
        public int CountryId { get; set; }

        public Country? Country { get; set; }
    }
}
