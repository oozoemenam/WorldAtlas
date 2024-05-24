using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Security;
using WorldAtlas.Data;
using WorldAtlas.Data.Models;

namespace WorldAtlas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public SeedController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult> Import()
        {
            if (!_env.IsDevelopment()) throw new SecurityException("Not allowed");

            var path = Path.Combine(_env.ContentRootPath, "Data/Source/cities.xlsx");

            using var stream = System.IO.File.OpenRead(path);
            using var excelPackage = new ExcelPackage(stream);

            var worksheet = excelPackage.Workbook.Worksheets[0];

            var nEndRow = worksheet.Dimension.End.Row;

            var numberOfCountriesAdded = 0;
            var numberOfCitiesAdded = 0;

            var countriesByName = _context.Countries
                .AsNoTracking()
                .ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);

            for (int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow, 1, nRow, worksheet.Dimension.End.Column];
                var countryName = row[nRow, 5].GetValue<string>();
                var iso2 = row[nRow, 6].GetValue<string>();
                var iso3 = row[nRow, 7].GetValue<string>();

                if (countriesByName.ContainsKey(countryName)) continue;

                var country = new Country
                {
                    Name = countryName,
                    ISO2Code = iso2,
                    ISO3Code = iso3,
                };

                await _context.Countries.AddAsync(country);
                countriesByName.Add(countryName, country);
                numberOfCountriesAdded++;
            }
            if (numberOfCountriesAdded > 0) await _context.SaveChangesAsync();

            var cities = _context.Cities
                .AsNoTracking()
                .ToDictionary(x => (
                Name: x.Name,
                Longitude: x.Longitude,
                Latitude: x.Latitude,
                CountryId: x.CountryId));

            for (int nRow = 2; nRow < nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow, 1, nRow, worksheet.Dimension.End.Column];

                var name = row[nRow, 1].GetValue<string>();
                var lat = row[nRow, 3].GetValue<decimal>();
                var lon = row[nRow, 4].GetValue<decimal>();
                var countryName = row[nRow, 5].GetValue<string>();

                var countryId = countriesByName[countryName].Id;

                if (cities.ContainsKey((
                    Name: name,
                    Longitude: lon,
                    Latitude: lat,
                    CountryId: countryId))) 
                    continue;

                var city = new City
                {
                    Name = name,
                    Longitude = lon,
                    Latitude = lat,
                    CountryId = countryId
                };

                _context.Cities.Add(city);
                numberOfCitiesAdded++;
            }
            if (numberOfCitiesAdded > 0) await _context.SaveChangesAsync();
            return new JsonResult(new
            {
                Cities = numberOfCitiesAdded,
                Countries = numberOfCountriesAdded
            });
        }
    }
}
