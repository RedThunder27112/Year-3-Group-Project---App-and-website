using LambdaPP_WebAPI_Alpha.Database.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "rating" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Rating
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [JsonPropertyName("rating_ID")]
        public int Rating_ID { get; set; }

        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }

        [JsonPropertyName("reviewer_ID")]
        public int reviewer_ID { get; set; }
        [JsonPropertyName("reviewer")]
        public Employee? reviewer { get; set; }


        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }

        [JsonPropertyName("rating_Rating")]
        public int Rating_Rating { get; set; }

        [JsonPropertyName("rating_Date")]
        public DateTime Rating_Date { get; set; }

        [JsonPropertyName("rating_Comment")]
        public string? Rating_Comment { get; set; }
        [JsonPropertyName("rating_Vector")]
        public string? Rating_Vector { get; set; }
        [JsonPropertyName("rating_Category")]
        public int? Rating_Category { get; set; }

    }
}
