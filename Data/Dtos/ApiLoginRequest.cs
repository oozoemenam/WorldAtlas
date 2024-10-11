﻿using System.ComponentModel.DataAnnotations;

namespace WorldAtlas.Data.Dtos;

public class ApiLoginRequest
{
    [Required(ErrorMessage = "Email is required")]
    public required string Email { get; set; }
    
    [Required(ErrorMessage = "Password is required")]
    public required string Password { get; set; }
}