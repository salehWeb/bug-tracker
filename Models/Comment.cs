using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Buegee.Models;

[Table("comment")]
public class Comment
{
    [Key, Column("id"), MinLength(26), MaxLength(26)]
    public string Id { get; set; } = null!;

    [Required, Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required, ForeignKey("Ticket"), Column("ticket_id"), MinLength(26), MaxLength(26)]
    public string TicketId { get; set; } = null!;
    public Ticket Ticket { get; set; } = null!;

    [Required, ForeignKey("Content"), Column("content_id"), MinLength(26), MaxLength(26)]
    public string ContentId { get; set; } = null!;
    public Content Content { get; set; } = null!;

    [Required, ForeignKey("Commenter"), Column("commenter_id"), MinLength(26), MaxLength(26)]
    public string CommenterId { get; set; } = null!;
    public User Commenter { get; set; } = null!;
}
