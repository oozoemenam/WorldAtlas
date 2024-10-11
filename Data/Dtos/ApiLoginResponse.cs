namespace WorldAtlas.Data.Dtos;

public class ApiLoginResponse
{
    public bool Success { get; set; }
    
    public required string Message { get; set; }
    
    public string? Token { get; set; }
}