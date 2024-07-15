using LambdaPP_WebAPI_Alpha.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "task" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Task
    {
        [Key]
        [JsonPropertyName("task_ID")]
        public int? Task_ID { get; set; }
        [JsonPropertyName("act_ID")]
        public int Act_ID { get; set; }
        [JsonPropertyName("activity")]
        public Activity? activity { get; set; }
        [JsonPropertyName("task_Name")]
        public string? Task_Name { get; set; }
        [JsonPropertyName("task_Date_Started")]
        public DateTime Task_Date_Started { get; set; }
        [JsonPropertyName("task_Deadline")]
        public DateTime? Task_Deadline { get; set; }
        [JsonPropertyName("task_Description")]
        public string? Task_Description { get; set; }
        [JsonPropertyName("status_ID")]
        public int Status_ID { get; set; }
        [JsonPropertyName("status")]
        public Task_Status? status { get; set; }
        [JsonPropertyName("task_Enabled")]
        public bool Task_Enabled { get; set; }
        [JsonPropertyName("task_Employee_Bridges")]
        public List<Task_Employee_Bridge>? Task_Employee_Bridges { get; set; }
        [JsonPropertyName("employees")]
        public List<Employee>? Employees { get; set; }

        //[JsonPropertyName("task_Stock_Bridges")]
        //public List<Task_Stock_Bridge>? Task_Stock_Bridges { get; set; }
        
        //FOR SOME REASON, THIS BREAKS EVERYTHING? INCLUDING EMPLOYEES?!?!?!? 
        //[JsonPropertyName("stock")]
        //public List<Employee> stocks { get; set; }

        [JsonPropertyName("task_Equipment_Bridges")]
        public List<Task_Equipment_Bridge>? Task_Equipment_Bridges { get; set; }
        [JsonPropertyName("equipments")]
        public List<Equipment>? equipments { get; set; }

        [JsonPropertyName("requests")]
        public List<Task_Request>? requests { get; set; }


        /*[JsonPropertyName("task_Skill_Bridges")]
        public List<Task_Skill_Bridge>? Task_Skill_Bridges { get; set; }
        [JsonPropertyName("skills")]
        public List<Employee> skills { get; set; }
        */
        [JsonPropertyName("task_Updates")]
        public List<Task_Update>? Task_Updates { get; set; }
    }
}
