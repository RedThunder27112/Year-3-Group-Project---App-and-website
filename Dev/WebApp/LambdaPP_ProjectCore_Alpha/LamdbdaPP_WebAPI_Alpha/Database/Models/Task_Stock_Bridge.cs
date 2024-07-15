using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    [PrimaryKey(nameof(Task_ID), nameof(Stock_ID))]
    public class Task_Stock_Bridge
    {
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }
        [JsonPropertyName("task")]
        public LambdaPP_WebAPI_Alpha.Database.Models.Task? task { get; set; }
        [JsonPropertyName("stock_ID")]
        public int Stock_ID { get; set; }
        [JsonPropertyName("stock")]
        public Stock? stock { get; set; }
        [JsonPropertyName("quantity_Needed")]
        public int Quantity_Needed { get; set; }
        [JsonPropertyName("quantity_Used")]
        public int Quantity_Used { get; set; }
        [JsonPropertyName("tS_Enabled")]
        public Boolean TS_Enabled { get; set; }

    }
}
