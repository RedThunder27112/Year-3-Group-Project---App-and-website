using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    [PrimaryKey(nameof(Task_ID), nameof(Eqp_ID))]
    public class Task_Equipment_Bridge
    {
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }
        [JsonPropertyName("task")]
        public LambdaPP_WebAPI_Alpha.Database.Models.Task? task { get; set; }
        [JsonPropertyName("eqp_ID")]
        public int Eqp_ID { get; set; }
        [JsonPropertyName("equipment")]
        public Equipment? equipment { get; set; }
        [JsonPropertyName("quantity_Needed")]
        public int Quantity_Needed { get; set; }
        [JsonPropertyName("quantity_Held")]
        public int Quantity_Held { get; set; }
        [JsonPropertyName("tE_Enabled")]
        public Boolean TE_Enabled { get; set; }

    }
}
