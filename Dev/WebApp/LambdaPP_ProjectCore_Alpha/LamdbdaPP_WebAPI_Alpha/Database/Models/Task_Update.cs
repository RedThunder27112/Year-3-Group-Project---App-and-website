using Microsoft.SqlServer.Types;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "task" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Task_Update
    {
        [Key]
        [JsonPropertyName("update_ID")]
        public int Update_ID { get; set; }
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }
        [JsonPropertyName("task")]
        public Task? task { get; set; }
        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }
        [JsonPropertyName("employee")]
        public Employee? employee { get; set; }
        [JsonPropertyName("update_Time")]
        public DateTime Update_Time { get; set; }
        [JsonPropertyName("update_Description")]
        public string? Update_Description { get; set; }
        [JsonPropertyName("updated_Status_ID")]
        public int? Updated_Status_ID { get; set; }
        [JsonPropertyName("update_Enabled")]
        public bool Update_Enabled { get; set; }
        [JsonPropertyName("update_Location")]
        public string? Update_Location { get; set; }
    }
}
