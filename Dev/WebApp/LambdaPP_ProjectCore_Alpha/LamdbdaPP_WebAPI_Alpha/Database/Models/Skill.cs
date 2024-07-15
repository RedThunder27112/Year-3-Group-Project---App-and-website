using LambdaPP_WebAPI_Alpha.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "skills" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Skill
    {
        [Key]
        [JsonPropertyName("skill_ID")]
        public int Skill_ID { get; set; }
        [JsonPropertyName("skill_Name")]
        public string? Skill_Name { get; set; }
        [JsonPropertyName("skill_Description")]
        public string? Skill_Description { get; set; }
        [JsonPropertyName("skill_Enabled")]
        public bool Skill_Enabled { get; set; }
        [JsonPropertyName("employee_Skill_Bridges")]
        public List<Employee_Skill_Bridge>? Employee_Skill_Bridges { get; set; }
        [JsonPropertyName("employees")]
        public List<Employee>? employees { get; set; }
        /*[JsonPropertyName("task_Skill_Bridges")]
        public List<Task_Skill_Bridge>? Task_Skill_Bridges { get; set; }
        [JsonPropertyName("tasks")]
        public List<Database.Models.Task>? tasks { get; set; }*/
    }
}
