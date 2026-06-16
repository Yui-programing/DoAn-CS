using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace TuneVault.API.Filters
{
    /// <summary>
    /// Filter này báo cho Swagger biết cách hiển thị file upload fields đúng cách
    /// </summary>
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formFileParameters = context.MethodInfo
                .GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile))
                .ToList();

            if (formFileParameters.Count == 0)
                return;

            // Xóa các properties sai lầm của IFormFile
            foreach (var fileParam in formFileParameters)
            {
                var paramToRemove = operation.Parameters.FirstOrDefault(p => p.Name == fileParam.Name);
                if (paramToRemove != null)
                {
                    operation.Parameters.Remove(paramToRemove);
                }
            }

            // Thêm file upload field đúng cách
            foreach (var fileParam in formFileParameters)
            {
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = fileParam.Name,
                    In = ParameterLocation.Query,
                    Description = $"Upload file {fileParam.Name}",
                    Required = true,
                    Schema = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    }
                });
            }

            // Cập nhật RequestBody để hiển thị multipart/form-data
            if (!operation.RequestBody?.Content.ContainsKey("multipart/form-data") ?? true)
            {
                var requestBody = new OpenApiRequestBody();
                requestBody.Required = true;
                requestBody.Content.Add("multipart/form-data", new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, OpenApiSchema>
                        {
                            { "stageName", new OpenApiSchema { Type = "string", Description = "Tên nghệ danh" } },
                            { "genres", new OpenApiSchema { Type = "string", Description = "Thể loại nhạc (tùy chọn)" } },
                            { "idCard", new OpenApiSchema { Type = "string", Format = "binary", Description = "Ảnh CMND/CCCD" } }
                        }
                    }
                });
                operation.RequestBody = requestBody;
            }
        }
    }
}
