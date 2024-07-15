using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "Task_Statuses" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Task_Status
    {
        [Key]
        [JsonPropertyName("status_ID")]
        public int Status_ID { get; set; }
        [JsonPropertyName("status_Name")]
        public string? Status_Name { get; set; }
        [JsonPropertyName("tasks")]
        public List<Task>? tasks { get; set; }
    }
}
