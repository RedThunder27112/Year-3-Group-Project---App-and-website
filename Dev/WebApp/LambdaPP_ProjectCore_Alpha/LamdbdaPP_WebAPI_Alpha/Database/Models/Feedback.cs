using LambdaPP_WebAPI_Alpha.Database.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "rating" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Feedback
    {
        [Key]
        [JsonPropertyName("feedback_ID")]
        public int Feedback_ID { get; set; }

        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }

        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }

        [JsonPropertyName("feedback_Feedback")]
        public string? Feedback_Feedback { get; set; }

        [JsonPropertyName("Feedback_Date")]
        public DateTime Feedback_Date { get; set; }

    }
}
