using Buegee.Data;
using Buegee.DTO;
using Buegee.Models;
using Buegee.Services.AuthService;
using Buegee.Utils;
using Buegee.Utils.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Buegee.Utils.Utils;

[ApiRoute("project")]
[Consumes("application/json")]
public class ProjectController : Controller
{
    private readonly DataContext _ctx;
    private readonly IAuthService _auth;

    public ProjectController(DataContext ctx, IAuthService auth)
    {
        _auth = auth;
        _ctx = ctx;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDTO dto)
    {
        var result = _auth.CheckPermissions(HttpContext, out var userId);

        if (result is not null) return result;

        if (TryGetModelErrorResult(ModelState, out var modelResult)) return modelResult!;


        var isFound = await _ctx.Projects.AnyAsync((p) => p.Name == dto.Name && p.OwnerId == userId);

        if (isFound) return new HttpResult()
                            .IsOk(false)
                            .Message($"there a project name with the same name as {dto.Name}, please chose another name")
                            .StatusCode(400).Get();


        var data = _ctx.Projects.Add(new Project()
        {
            Name = dto.Name,
            IsPrivate = dto.IsPrivate,
            OwnerId = userId,
        });

        await _ctx.SaveChangesAsync();

        return new HttpResult()
                            .IsOk(true)
                            .Body(new { data.Entity.Members, data.Entity.Owner, data.Entity.CreatedAt, data.Entity.IsPrivate, data.Entity.Name, data.Entity.Id })
                            .Message($"project {dto.Name} successfully created")
                            .Get();
    }

    [HttpGet("projects/{page?}")]
    public async Task<IActionResult> GetMyProjects([FromRoute] int page = 1, [FromQuery] int take = 10)
    {
        if (!_auth.TryGetUser(HttpContext, out var userId) || userId is null) return new HttpResult().IsOk(true).Message("no projects found for you, to create project please sing-up").StatusCode(404).Get();

        var projects = await _ctx.Projects
                        .Where((p) => p.OwnerId == userId)
                        .OrderBy((p) => p.CreatedAt)
                        .Select((p) => new {
                            members = p.Members.Count + 1,
                            tickets = p.Tickets.Count,
                            createdAt = p.CreatedAt,
                            id = p.Id,
                            isPrivate = p.IsPrivate,
                            name = p.Name
                        })
                        .Skip((page - 1) * take)
                        .Take(take)
                        .ToListAsync();

        if (projects is null || projects.Count == 0) return new HttpResult()
                                    .IsOk(true)
                                    .Message("sorry, no project found")
                                    .StatusCode(404)
                                    .Get();
        return new HttpResult()
                .IsOk(true)
                .Body(projects)
                .StatusCode(200)
                .Get();
    }

    [HttpGet("{projectId}")]
    public async Task<IActionResult> xdvsv([FromRoute] int projectId)
    {
        if (!_auth.TryGetUser(HttpContext, out var user) || user is null) return new HttpResult().IsOk(true).Message("no projects found for you, to create project please sing-up").StatusCode(404).Get();

        var project = await _ctx.Projects
                        .Where((p) => p.Id == projectId)
                        .Select((p) => new {
                            activities = p.Activities,
                            createdAt = p.CreatedAt,
                            description = p.Description,
                            ownerId = p.OwnerId,
                            members = p.Members.Count,
                        })
                        .FirstOrDefaultAsync();

        if (project is null) return new HttpResult()
                            .IsOk(true)
                            .Message("sorry, project not found")
                            .StatusCode(404)
                            .Get();

        return new HttpResult()
                .IsOk(true)
                .Body(project)
                .StatusCode(200)
                .Get();
    }

    [HttpGet("count")]
    public async Task<IActionResult> GetMyProjectsCount([FromQuery] int take = 10)
    {
        if (!_auth.TryGetUser(HttpContext, out var userId) || userId is null) return new HttpResult().IsOk(true).Message("no projects found for you, to create project please sing-up").StatusCode(404).Get();

        var projectsCount = await _ctx.Projects.Where((p) => p.OwnerId == userId).CountAsync();

        int pages = (int)Math.Ceiling((double) projectsCount / take);

        return new HttpResult()
                .IsOk(true)
                .Body(pages)
                .StatusCode(200)
                .Get();
    }
}
