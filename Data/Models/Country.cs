using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WorldAtlas.Data.Models
{
    [Table("Countries")]
    [Index(nameof(Name))]
    [Index(nameof(ISO2Code))]
    [Index(nameof(ISO3Code))]
    public class Country
    {
        [Key]
        [Required]
        public int Id { get; set; }

        public required string Name { get; set; }

        [JsonPropertyName("iso2")]
        public required string ISO2Code { get; set; }

        [JsonPropertyName("iso3")]
        public required string ISO3Code { get; set; }

        public ICollection<City>? Cities { get; set; }
    }
}
