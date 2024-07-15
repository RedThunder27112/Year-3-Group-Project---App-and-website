using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.IdentityModel.Tokens;

namespace LambdaPP_WebAPI_Alpha.Helpers
{
    public static class ImageFileHandler
    {
        public static string getMimeType(string filePath)
        {
            if ((new FileExtensionContentTypeProvider()).TryGetContentType(filePath, out string? contentType))
                return contentType;
            //no contenttype found, return default
            return "application/octet-stream";
        }

        public static IActionResult deleteImage(string folder, int id, ControllerBase controller) {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);

            //get the files that have this name, with any extension - should only be 1 file
            var imageFiles = Directory.GetFiles(folderPath, $"{id}.*");

            if (imageFiles.Length == 0) { return controller.NotFound(); }

            //should be the 1st and only image file
            var filePath = imageFiles[0];
            try
            {
                File.Delete(filePath);
                return controller.Ok();
            }
            catch (FileNotFoundException)
            {
                return controller.NotFound();
            }
        }

        public static IActionResult getImage(string folder, int id, ControllerBase controller)
        {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);

            //get the files that have this name, with any extension - should only be 1 file
            var imageFiles = Directory.GetFiles(folderPath, $"{id}.*");

            if (imageFiles.Length == 0) { return controller.NotFound(); }

            //should be the 1st and only image file
            var filePath = imageFiles[0];
            try
            {
                var imageFileStream = File.OpenRead(filePath);
                return controller.File(imageFileStream, ImageFileHandler.getMimeType(filePath));
            }
            catch (FileNotFoundException)
            {
                return controller.NotFound();
            }
        }


        public static int getNumDocs(string folder,string name, string surname, int id, ControllerBase controller)
        {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);

            //get the files that have this name, with any extension - should only be 1 file
            string fileNameFull = id + "_" + name + "_" + surname;
            var imageFiles = Directory.GetFiles(folderPath, $"{fileNameFull}*");


            if (imageFiles.IsNullOrEmpty()) { return 0; }

            return imageFiles.Length;
        }

        public static IActionResult getDocument(string folder, string name, string surname, int docNum, int id, ControllerBase controller)
        {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);

            //get the files that have this name, with any extension - should only be 1 file
            string fileNameFull = id + "_" + name + "_" + surname + "_" + docNum;
            var imageFiles = Directory.GetFiles(folderPath, $"{fileNameFull}.*");

            if (imageFiles.Length == 0) { return controller.NotFound(); }

            //should be the 1st and only image file
            var filePath = imageFiles[0];
            try
            {
                var imageFileStream = File.OpenRead(filePath);
                return controller.File(imageFileStream, ImageFileHandler.getMimeType(filePath));
            }
            catch (FileNotFoundException)
            {
                return controller.NotFound();
            }
        }

        public static Boolean hasImage(string folder, int id, ControllerBase controller)
        {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);

            //get the files that have this name, with any extension - should only be 1 file
            var imageFiles = Directory.GetFiles(folderPath, $"{id}.*");

            if (imageFiles.Length == 0) { return false; }
            return true;
        }

        public static Boolean hasDoc(string folder, string id, ControllerBase controller)
        {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);

            //get the files that have this name, with any extension - should only be 1 file
            var imageFiles = Directory.GetFiles(folderPath, $"{id}.*");

            if (imageFiles.Length == 0) { return false; }
            return true;
        }


        public static async Task<IActionResult> postImage(string folder, int id, IFormFile file, ControllerBase controller)
        {
            // code to save the file
            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);
            if (file.Length > 0)
            {
                string fileName = file.FileName;
                string fileExtension;
                //default extension if none is provided
                if (!fileName.Contains("."))
                    fileExtension = ".jpg";
                else
                    fileExtension = fileName.Substring(fileName.IndexOf("."));

                //delete the old file
            
                if (hasImage(folder, id, controller))
                    deleteImage(folder, id, controller);

                //ensure the pic is always named based off of the task update id
                using (var fileStream = new FileStream(Path.Combine(uploads, id.ToString() + fileExtension), FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
            }


            return controller.Ok();
        }

        public static string postDoc(string name, string surname, string folder, int id, IFormFile file, ControllerBase controller)
        {


            string fileNameFull = "";
            // code to save the file
            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "Database", "images", folder);
            if (file.Length > 0)
            {
                string fileName = file.FileName;
                string fileExtension;
                //default extension if none is provided
                if (!fileName.Contains("."))
                    fileExtension = ".jpg";
                else
                    fileExtension = fileName.Substring(fileName.IndexOf("."));

                //get file name
                int count = 1;
                fileNameFull = id+"_"+ name + "_" + surname + "_" + count;
                //delete the old file
                if (hasDoc(folder, fileNameFull, controller))
                {
                    while(hasDoc(folder, fileNameFull, controller))
                    {
                        count++;
                        fileNameFull = id + "_" + name + "_" + surname + "_" + count;
                    }
                }

                //ensure the pic is always named based off of the task update id
                using (var fileStream = new FileStream(Path.Combine(uploads, fileNameFull.ToString() + fileExtension), FileMode.Create))
                {
                     file.CopyToAsync(fileStream);
                }
            }


            return fileNameFull;
        }

    }
}
