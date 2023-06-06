using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Buegee.Models;

[Table("user")]
[Index(nameof(FirstName), nameof(LastName))]
[Index(nameof(Email), IsUnique = true)]
public class User
{
    [Key, Column("id")]
    public int Id {get; set;}

    [Required, Column("email"), StringLength(100), EmailAddress]
    public string Email { get; set; } = null!;

    [Required, Column("first_name"), StringLength(50)]
    public string FirstName { get; set; } = null!;

    [Required, Column("last_name"), StringLength(50)]
    public string LastName { get; set; } = null!;

    [Required, Column("password_hash")]
    public byte[] PasswordHash { get; set; } = null!;

    [Required, Column("password_salt")]
    public byte[] PasswordSalt { get; set; } = null!;

    [Required, Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required, ForeignKey("Content"), Column("content_id")]
    public int ContentId { get; set; }
    public Content Content { get; set; } = null!;

    [Required, ForeignKey("Image"), Column("image_id")]
    public int ImageId { get; set; }
    public Document Image { get; set; } = null!;

    [Column("bio"), StringLength(100)]
    public string Bio { get; set; } = string.Empty;

    [Column("member_ships")]
    public List<Member> MemberShips { get; set; } = new List<Member>();

    [Column("Projects")]
    public List<Project> Projects { get; set; } = new List<Project>();
}
