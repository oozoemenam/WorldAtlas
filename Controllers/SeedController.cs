using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using WorldAtlas.Data;
using WorldAtlas.Data.Models;

namespace WorldAtlas.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
// [Authorize(Roles = "Administrator")]
public class SeedController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public SeedController(
        ApplicationDbContext context,
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IWebHostEnvironment env,
        IConfiguration configuration
    )
    {
        _context = context;
        _roleManager = roleManager;
        _userManager = userManager;
        _env = env;
        _configuration = configuration;
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

    [HttpGet]
    public async Task<ActionResult> CreateDefaultUsers()
    {
        string role_RegisteredUser = "RegisteredUser";
        string role_Administrator = "Administrator";

        if (await _roleManager.FindByNameAsync(role_RegisteredUser) == null)
        {
            await _roleManager.CreateAsync(new IdentityRole(role_RegisteredUser));
        }

        if (await _roleManager.FindByNameAsync(role_Administrator) == null)
        {
            await _roleManager.CreateAsync(new IdentityRole(role_Administrator));
        }

        var addedUserList = new List<ApplicationUser>();

        var email_Admin = "admin@email.com";
        if (await _userManager.FindByNameAsync(email_Admin) == null)
        {
            var user_Admin = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = email_Admin,
                Email = email_Admin,
            };
            await _userManager.CreateAsync(user_Admin, _configuration["DefaultPasswords:Administrator"]!);
            await _userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
            await _userManager.AddToRoleAsync(user_Admin, role_Administrator);

            user_Admin.EmailConfirmed = true;
            user_Admin.LockoutEnabled = false;

            addedUserList.Add(user_Admin);
        }

        var email_User = "user@email.com";
        if (await _userManager.FindByNameAsync(email_User) == null)
        {
            var user_User = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = email_User,
                Email = email_User
            };

            await _userManager.CreateAsync(user_User, _configuration["DefaultPasswords:RegisteredUser"]!);
            await _userManager.AddToRoleAsync(user_User, role_RegisteredUser);

            user_User.EmailConfirmed = true;
            user_User.LockoutEnabled = false;

            addedUserList.Add(user_User);
        }

        if (addedUserList.Count > 0) await _context.SaveChangesAsync();
        return new JsonResult(new
        {
            addedUserList.Count,
            Users = addedUserList
        });
    }
}
