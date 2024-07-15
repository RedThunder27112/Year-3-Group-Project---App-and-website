using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "Saved Location" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    public class SavedLocation
    {
        [Key]
        [JsonPropertyName("loc_ID")]
        public int Loc_ID { get; set; }
        [JsonPropertyName("loc_Name")]
        public string? Loc_Name { get; set; }
        [JsonPropertyName("loc_Coordinates")]
        public string? Loc_Coordinates { get; set; }
        [JsonPropertyName("loc_Enabled")]
        public bool loc_Enabled { get; set; }
    }
}
