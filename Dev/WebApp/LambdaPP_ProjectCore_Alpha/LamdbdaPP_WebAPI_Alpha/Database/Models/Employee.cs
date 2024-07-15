using Humanizer;
using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Drawing;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "employee" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Employee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [JsonPropertyName("emp_ID")]
        public int? Emp_ID { get; set; }
        [JsonPropertyName("emp_Username")]
        public string? Emp_Username { get; set; }
        [JsonPropertyName("emp_Password")]
        public string? Emp_Password { get; set; }
        [JsonPropertyName("emp_Name")]
        public string? Emp_Name { get; set; }
        [JsonPropertyName("emp_Sur")]
        public string? Emp_Sur { get; set; }
        [JsonPropertyName("emp_IsAdmin")]
        public bool Emp_IsAdmin { get; set; }
        [JsonPropertyName("emp_IsContractor")]
        public bool Emp_IsContractor { get; set; }
        // public Image? Emp_ID_Image { get; set; }
        [JsonPropertyName("emp_ID_Image")]
        public byte[]? Emp_ID_Image { get; set; }
        [JsonPropertyName("emp_DateRegistered")]
        public DateTime Emp_DateRegistered { get; set; }
        [JsonPropertyName("emp_Enabled")]
        public bool Emp_Enabled { get; set; }
        [JsonPropertyName("task_Employee_Bridges")]
        public List<Task_Employee_Bridge>? Task_Employee_Bridges { get; set; }
        [JsonPropertyName("tasks")]
        public List<Task>? Tasks { get; set; }
        //note: these are the ratings they have GIVEN, not recieved
        [JsonPropertyName("ratingsGiven")]
        public List<Rating>? ratingsGiven { get; set; }

        [JsonPropertyName("employee_Skill_Bridges")]
        public List<Employee_Skill_Bridge>? Employee_Skill_Bridges { get; set; }
        [JsonPropertyName("skills")]
        public List<Skill>? skills { get; set; }

        [JsonPropertyName("task_Updates")]
        public List<Task_Update>? Task_Updates { get; set; }


        [JsonPropertyName("emp_Rating")]
        public decimal Emp_Rating { get; set; }

    }
}
