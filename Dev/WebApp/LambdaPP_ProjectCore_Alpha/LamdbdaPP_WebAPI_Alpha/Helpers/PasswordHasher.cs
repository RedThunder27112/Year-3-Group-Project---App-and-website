using System.Security.Cryptography;
using System.Text;

namespace LamdbdaPP_WebAPI_D3.Helpers
{
    public class PasswordHasher
    {
        // hash function
        public static string HashPassword(string password)
        {
            SHA256 algorithm = SHA256.Create();
            byte[] byteArray = null;
            byteArray = algorithm.ComputeHash(Encoding.Default.GetBytes(password));
            string hashedPassword = "";
            for (int i = 0; i < byteArray.Length; i++)
            {
                hashedPassword += byteArray[i].ToString("x2");
            }
            return hashedPassword;
        }
    }
}
