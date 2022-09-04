﻿using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace server.Services.JsonWebToken
{
    public class JsonWebToken : IJsonWebToken
    {
        private readonly IConfiguration _configuration;

        public JsonWebToken(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(int id, string? role)
        {
            var claims = new List<Claim>
            {
                new Claim("id", id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("secretToken").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public int? VerifyToken(string token)
        {
            if (token == null)
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration.GetSection("secretToken").Value);
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                int userId = int.Parse(jwtToken.Claims.First(x => x.Type == "id").Value);
                return userId;
            }
            catch
            {
                return null;
            }
        }


        public string GenerateRefreshToken(int id)
        {
            var claims = new List<Claim> {
                new Claim("id", id.ToString()),
                new Claim("refresh-token", "refresh-token-Secret"),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("secretToken").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var refreshToken = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4320), // or 6 months
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(refreshToken);
        }


    }
}
