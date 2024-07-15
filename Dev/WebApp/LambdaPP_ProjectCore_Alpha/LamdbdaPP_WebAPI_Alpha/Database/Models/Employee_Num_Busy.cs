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
    public class Employee_Num_Busy
    {
      
        [JsonPropertyName("emp_ID")]
        public int? Emp_ID { get; set; }
        [JsonPropertyName("num_Busy")]
        public int Num_Busy { get; set; }


    }
}
