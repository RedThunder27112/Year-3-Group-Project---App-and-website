using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "task" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Equipment
    {
        [Key]
        [JsonPropertyName("eqp_ID")]
        public int Eqp_ID { get; set; }
        [JsonPropertyName("eqp_Name")]
        public string? Eqp_Name { get; set; }
        [JsonPropertyName("eqp_Description")]
        public string? Eqp_Description { get; set; }
        [JsonPropertyName("eqp_Quantity_Total")]
        public int Eqp_Quantity_Total { get; set; }
        [JsonPropertyName("eqp_Enabled")]
        public bool Eqp_Enabled { get; set; }
        [JsonPropertyName("task_Equipment_Bridges")]
        public List<Task_Equipment_Bridge>? Task_Equipment_Bridges { get; set; }
        [JsonPropertyName("tasks")]
        public List<Task>? tasks { get; set; }
    }
}
