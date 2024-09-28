﻿using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace PatientManagementApp
{
    public class SwaggerFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formFileParams = context.ApiDescription.ParameterDescriptions
                .Where(p => p.ModelMetadata.ModelType == typeof(IFormFile) || p.ModelMetadata.ModelType == typeof(IFormFile))
                .ToList();

            if (formFileParams.Any())
            {
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = {
                           ["multipart/form-data"] = new OpenApiMediaType
                           {
                               Schema = new OpenApiSchema
                               {
                                   Type = "object",
                                   Properties = formFileParams.ToDictionary(
                                       p => p.Name,
                                       p => new OpenApiSchema
                                       {
                                           Type = "string",
                                           Format = "binary",
                                           Nullable = true // Allow null values  
                                       }
                                   )
                               }
                           }
                       }
                };
            }
        }
    }
}
