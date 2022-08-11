﻿using Firebase.Auth;
using Firebase.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Models.db;
using server.Services.JsonWebToken;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly Context _context;

        private readonly IConfiguration _configuration;
        private readonly IJsonWebToken _token;

        public FilesController(IConfiguration configuration, Context context, IJsonWebToken token)
        {
            _context = context;
            _token = token;
            _configuration = configuration;
        }



        [HttpPost("{ticketId}"), Authorize]
        public async Task<IActionResult> UploadFile(IFormFile file, int ticketId, string Description)
        {
            string uuid = Guid.NewGuid().ToString();
            string[] array = file.FileName.Split('.');
            string type = array[array.Length - 1];

            string fileNameForShaft = uuid + "." + type;
            if (file.Length > 0)
            {

                var stream = file.OpenReadStream();

                var API = new FirebaseAuthProvider(new FirebaseConfig(_configuration.GetSection("FireBase:apiKay").Value));

                var user = await API.SignInWithEmailAndPasswordAsync(
                _configuration.GetSection("Admin:Email").Value,
                _configuration.GetSection("Admin:Password").Value
                );

                var cancellation = new CancellationTokenSource();

                var UploadFile = new FirebaseStorage(
                    _configuration.GetSection("FireBase:storageBucket").Value,
                    new FirebaseStorageOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(user.FirebaseToken),
                        ThrowOnCancel = true
                    }
                ).Child("images").Child($"{fileNameForShaft}")
                .PutAsync(stream, cancellation.Token);






                string? header = Request.Headers.Authorization;

                string[] token = header.Split(' ');

                var id = _token.VerifyToken(token[1]);

                if (id == null) return Unauthorized();

                var newFille = new Fille
                {
                    type = type == "png" || type == "svg" || type == "image" || type == "jpeg" || type == "jpg" ? "Image" : "Document",
                    name = fileNameForShaft,
                    Description = Description,
                    TicketId = ticketId,
                    CreatorId = (int)id,
                    Url = $"https://firebasestorage.googleapis.com/v0/b/{_configuration.GetSection("FireBase:storageBucket").Value}/o/images%2F{fileNameForShaft}?alt=media",
                    CreatedAt = DateTime.UtcNow
                };

                var NewFile = _context.Filles.Add(newFille);


                try
                {

                    await UploadFile;
                    await _context.SaveChangesAsync();
                    return Ok(newFille);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                    return BadRequest("sorry something went wrong 😥");
                }
                finally
                {
                    stream.Close();
                }
            }
            else
            {
                return Content("file not selected");
            }

        }


        [HttpPatch("{id}"), Authorize]
        public async Task<IActionResult> UpdateFile([FromRoute] int id, [FromBody] string Description)
        {
            var file = await _context.Filles.FirstOrDefaultAsync(file => file.Id == id);

            if (file == null) return NotFound();

            string? header = Request.Headers.Authorization;

            string[] token = header.Split(' ');

            var UserId = _token.VerifyToken(token[1]);

            if (UserId == null) return Unauthorized();

            if (file.CreatorId != (int)UserId) return Unauthorized();

            file.Description = Description;

            await _context.SaveChangesAsync();
            return Ok(file);
        }


        [HttpDelete("{id}"), Authorize]
        public async Task<IActionResult> DeleteFile([FromRoute] int id)
        {
            var file = await _context.Filles.FirstOrDefaultAsync(file => file.Id == id);

            if (file == null) return NotFound();
            string? header = Request.Headers.Authorization;

            string[] token = header.Split(' ');

            var UserId = _token.VerifyToken(token[1]);

            if (UserId == null) return Unauthorized();

            if (file.CreatorId != (int)UserId) return Unauthorized();

            var API = new FirebaseAuthProvider(new FirebaseConfig(_configuration.GetSection("FireBase:apiKay").Value));

            var user = await API.SignInWithEmailAndPasswordAsync(
            _configuration.GetSection("Admin:Email").Value,
            _configuration.GetSection("Admin:Password").Value
            );

            var DeleteFile = new FirebaseStorage(
                _configuration.GetSection("FireBase:storageBucket").Value,
                new FirebaseStorageOptions
                {
                    AuthTokenAsyncFactory = () => Task.FromResult(user.FirebaseToken),
                    ThrowOnCancel = true
                }
            ).Child("images")
             .Child($"{file.name}")
             .DeleteAsync();

            try
            {
                await DeleteFile;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return BadRequest("sorry something went wrong 😥");
            }

            _context.Filles.Remove(file);
            await _context.SaveChangesAsync();
            return Ok("deleted");
        }

        [HttpGet("{id}"), Authorize]
        public async Task<IActionResult> GetFile([FromRoute] int id)
        {
            var file = await _context.Filles.FirstOrDefaultAsync(file => file.Id == id);

            if (file == null) return NotFound();

            return Ok(file);
        }

        [HttpGet("Ticket/{TicketId}"), Authorize]
        public async Task<IActionResult> GetFiles([FromRoute] int TicketId)
        {
            var files = await _context.Filles.Where(files => files.TicketId == TicketId).ToListAsync();

            return Ok(files);
        }
    }
}