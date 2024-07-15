using LambdaPP_WebAPI_Alpha.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "task_templates" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.- Gage
    public class Task_Template
    {
        [Key]
        [JsonPropertyName("template_ID")]
        public int? Template_ID { get; set; }
        [JsonPropertyName("act_ID")]
        public int? Act_ID { get; set; }
        [JsonPropertyName("task_Name")]
        public string? Task_Name { get; set; }
        [JsonPropertyName("task_Length_Days")]
        public int? Task_Length_Days { get; set; }

        [JsonPropertyName("task_Description")]
        public string? Task_Description { get; set; }
        [JsonPropertyName("template_Enabled")]
        public bool Template_Enabled { get; set; }
        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("task_Template_Skill_Bridges")]
        public List<Task_Template_Skill_Bridge>? Task_Template_Skill_Bridges { get; set; }
        
    }
}
