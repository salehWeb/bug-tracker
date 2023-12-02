using Buegee.Data;
using Buegee.DTO;
using Buegee.Models;
using Buegee.Utils.Enums;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Buegee.Services.DataService;

public interface IDataService {
    public Task EditContent(ContentDTO dto, Content content, DataContext ctx);
    public Task<EntityEntry<Content>> CreateContent(ContentDTO dto, DataContext ctx);
    public Task JoinProjectActivity(string projectId, string userName, DataContext ctx);
    public Task CreateProjectActivity(string projectId, string projectName, DataContext ctx);
    public Task CreateTicketActivity(string projectId, string name, TicketType type, Status status, string? assignedTo, Priority priority, DataContext ctx);
    public Task UpdateTicketActivity(string projectId, string name, TicketType type, Status status, string? assignedTo, Priority priority, string? newName, TicketType? newType, Status? newStatus, string? newAssignedTo, Priority? newPriority, DataContext ctx);
    public Task DeleteTicketActivity(string projectId, string name, string by, DataContext ctx);
    public Task DeleteMemberActivity(string projectId, string memberName, DataContext ctx);
    public Task ChangeMemberRoleActivity(string projectId, string memberName, Role oldRole, Role newRole, DataContext ctx);
    public Task UpdateTicketStatusActivity(string projectId, string name, Status status, Status? newStatus, DataContext ctx);
    public Task TransferOwnershipActivity(string projectId, string projectName, string currentOwner, string newOwner, DataContext ctx);
    public Task ChangeVisibilityActivity(string projectId, string projectName, bool currentState, DataContext ctx);
    public Task ArchiveProjectActivity(string projectId, string projectName, bool currentState, DataContext ctx);
    public Task ChangeProjectNameActivity(string projectId, string oldProjectName, string newProjectName, DataContext ctx);
}