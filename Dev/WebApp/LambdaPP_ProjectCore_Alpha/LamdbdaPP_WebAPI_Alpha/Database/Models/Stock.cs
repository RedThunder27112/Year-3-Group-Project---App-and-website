using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "skills" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Stock
    {
        [Key]
        [JsonPropertyName("stock_ID")]
        public int Stock_ID { get; set; }
        [JsonPropertyName("stock_Name")]
        public string? Stock_Name { get; set; }
        [JsonPropertyName("stock_Description")]
        public string? Stock_Description { get; set; }
        [JsonPropertyName("stock_Quantity")]
        public int Stock_Quantity { get; set; }
        [JsonPropertyName("stock_Enabled")]
        public bool Stock_Enabled { get; set; }

        [JsonPropertyName("stock_Lead_Time")]
        public int Stock_Lead_Time { get; set; }
    

        [JsonPropertyName("task_Stock_Bridges")]
        public List<Task_Stock_Bridge>? Task_Stock_Bridges { get; set; }
        //[JsonPropertyName("tasks")]
        //public List<Task>? tasks { get; set; }
    }
}
