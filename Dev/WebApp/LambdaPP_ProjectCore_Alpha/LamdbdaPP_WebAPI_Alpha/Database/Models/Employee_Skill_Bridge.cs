using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    [PrimaryKey(nameof(Emp_ID), nameof(Skill_ID))]
    public class Employee_Skill_Bridge
    {
        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }
        [JsonPropertyName("employee")]
        public Employee? employee { get; set; }
        [JsonPropertyName("skill_ID")]
        public int Skill_ID { get; set; }
        [JsonPropertyName("skill")]
        public Skill? skill { get; set; }

        [JsonPropertyName("skill_Level")]
        public int Skill_Level { get; set; }
       
        [JsonPropertyName("eS_Enabled")]
        public Boolean ES_Enabled { get; set; }
    }
}
