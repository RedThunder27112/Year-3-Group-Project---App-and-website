using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "activity" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Activity
    {
        [Key]
        [JsonPropertyName("act_ID")]
        public int Act_ID { get; set; }
        [JsonPropertyName("act_Name")]
        public string? Act_Name { get; set; }
        [JsonPropertyName("act_Description")]
        public string? Act_Description { get; set; }
        [JsonPropertyName("act_Creation_Date")]
        public DateTime? Act_Creation_Date { get; set; }
        [JsonPropertyName("act_Recommended_Min_Emps_Per_Task")]
        public int? Act_Recommended_Min_Emps_Per_Task { get; set; }
        [JsonPropertyName("act_Recommended_Max_Emps_Per_Task")]
        public int? Act_Recommended_Max_Emps_Per_Task { get; set; }
        [JsonPropertyName("act_Recommended_Max_Tasks_Per_Emp")]
        public int? Act_Recommended_Max_Tasks_Per_Emp { get; set; }

        [JsonPropertyName("tasks")]
        public List<Task>? tasks { get; set; }
    }
}
