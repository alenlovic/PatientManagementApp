//using Microsoft.OpenApi.Models;
//using Swashbuckle.AspNetCore.SwaggerGen;
//using System.Collections.Generic;
//using System.Linq;

//public class SwaggerFileOperationFilter : IOperationFilter
//{
//    public void Apply(OpenApiOperation operation, OperationFilterContext context)
//    {
//        var fileParams = context.MethodInfo.GetParameters()
//            .Where(p => p.ParameterType == typeof(IFormFile) || p.ParameterType == typeof(Stream))
//            .ToList();

//        if (fileParams.Any())
//        {
//            // Clear any existing parameters to avoid duplicates
//            operation.Parameters.Clear();

//            operation.RequestBody = new OpenApiRequestBody
//            {
//                Content = new Dictionary<string, OpenApiMediaType>
//                {
//                    ["multipart/form-data"] = new OpenApiMediaType
//                    {
//                        Schema = new OpenApiSchema
//                        {
//                            Type = "object",
//                            Properties = fileParams
//                                .Where(p => p.Name != null) // Ensure parameter name is not null
//                                .ToDictionary(
//                                    p => p.Name!,
//                                    p => new OpenApiSchema
//                                    {
//                                        Type = "string",
//                                        Format = "binary"
//                                    })
//                        }
//                    }
//                }
//            };
//        }
//    }
//}
