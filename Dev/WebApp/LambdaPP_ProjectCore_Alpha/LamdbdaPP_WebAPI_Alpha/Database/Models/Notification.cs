using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "activity" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Notification
    {
        [Key]
        [JsonPropertyName("not_ID")]
        public int Not_ID { get; set; }
        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }

        [JsonPropertyName("not_Description")]
        public string? Not_Description { get; set; }

        [JsonPropertyName("not_Date")]
        public DateTime Not_Date { get; set; }

    
        [JsonPropertyName("not_Viewed")]
        public bool Not_Viewed { get; set; }


    }
}
