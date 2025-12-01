namespace JustHallAPI.Helpers
{
    public static class FileUploadHelper
    {
        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public static async Task<(bool success, string? filePath, string? error)> SaveProfilePhoto(
            IFormFile file,
            string uploadsFolder = "media/profile_photos")
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                    return (false, null, "No file uploaded");

                if (file.Length > MaxFileSize)
                    return (false, null, "File size exceeds 5MB limit");

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedImageExtensions.Contains(extension))
                    return (false, null, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp, avif");

                // Create directory if not exists
                var fullUploadPath = Path.Combine(Directory.GetCurrentDirectory(), uploadsFolder);
                Directory.CreateDirectory(fullUploadPath);

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(fullUploadPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return relative path for database
                var relativePath = $"{uploadsFolder.Replace("media/", "")}/{fileName}";
                return (true, relativePath, null);
            }
            catch (Exception ex)
            {
                return (false, null, $"Error saving file: {ex.Message}");
            }
        }

        public static bool DeleteFile(string? relativeFilePath)
        {
            if (string.IsNullOrEmpty(relativeFilePath))
                return false;

            try
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "media", relativeFilePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
