using Humanizer;
using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Drawing;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is not a database model, this is just a useful structure
    public class EmployeeWithAvailability
    {

        [JsonPropertyName("employee")]
        public Employee? employee { get; set; }
        [JsonPropertyName("availableDates")]
        public List<DateTime>? availableDates { get; set; }
    }
}
