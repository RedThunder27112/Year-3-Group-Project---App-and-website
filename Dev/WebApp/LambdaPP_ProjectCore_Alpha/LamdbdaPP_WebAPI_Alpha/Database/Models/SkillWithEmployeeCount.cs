using Humanizer;
using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Drawing;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is not a database model, this is just a useful structure - to get the number of employees who have a skill
    public class SkillWithEmployeeCount
    {
      
        [JsonPropertyName("skill")]
        public Skill? skill { get; set; }
        [JsonPropertyName("emp_Count")]
        public int emp_Count { get; set; }


    }
}
