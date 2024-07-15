using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    public class Task_Employee_Bridge
    {
        [Key]
        [JsonPropertyName("tEBridge_ID")]
        public int TEBridge_ID { get; set; }
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }
        [JsonPropertyName("task")]
        public LambdaPP_WebAPI_Alpha.Database.Models.Task? task { get; set; }
        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }
        [JsonPropertyName("employee")]
        public Employee? employee { get; set; }
        [JsonPropertyName("isSupervisor")]
        public Boolean IsSupervisor { get; set; }
        [JsonPropertyName("note")]
        public String? Note { get; set; }
        [JsonPropertyName("feedback")]
        public String? Feedback { get; set; }
        [JsonPropertyName("tEm_Enabled")]
        public Boolean TEm_Enabled { get; set; }

        //[JsonPropertyName("ratings")]
        //public List<Rating>? Ratings { get; set; }

    }
}
