using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WorldAtlas.Data;
using WorldAtlas.Data.Dtos;
using WorldAtlas.Data.Models;

namespace WorldAtlas.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtHandler _jwtHandler;

    public AccountController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, JwtHandler jwtHandler)
    {
        _context = context;
        _userManager = userManager;
        _jwtHandler = jwtHandler;
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login(ApiLoginRequest loginRequest)
    {
        var user = await _userManager.FindByNameAsync(loginRequest.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
        {
            return Unauthorized(new ApiLoginResponse()
            {
                Success = false,
                Message = "Invalid Email or Password"
            });
        }

        var secToken = await _jwtHandler.GetTokenAsync(user);
        var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
        return Ok(new ApiLoginResponse()
        {
            Success = true,
            Message = "Login successful",
            Token = jwt
        });
    }
}