using Buegee.Utils.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Buegee.Services.AuthService;

public interface IAuthService
{
    public void LogIn(int Id, HttpContext ctx, Roles role = Roles.reporter);
    public IActionResult? CheckPermissions(HttpContext ctx, List<Roles> roles, out int? id);
    public IActionResult? CheckPermissions(HttpContext ctx, List<Roles> roles);
    public bool TryGetUser(HttpContext ctx, out User? user);
    public Task SetSessionAsync<T>(string sessionName, TimeSpan sessionTimeSpan, T payload, HttpContext ctx);
    public Task<T?> GetSessionAsync<T>(string sessionName, HttpContext ctx) where T : class;
    public Task DeleteSessionAsync(string sessionName, HttpContext ctx);

}
