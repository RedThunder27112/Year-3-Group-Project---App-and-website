using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "New_Employee_codes" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class New_Employee_Code
    {
        [Key]
        [JsonPropertyName("code_ID")]
        public int Code_ID { get; set; }
        [JsonPropertyName("code_Code")]
        public string? Code_Code { get; set; }
        [JsonPropertyName("new_Emp_Is_Admin")]
        public Boolean New_Emp_Is_Admin { get; set; }
        [JsonPropertyName("new_Emp_Is_Contractor")]
        public Boolean New_Emp_Is_Contractor { get; set; }
        [JsonPropertyName("contractor_Expiration_date")]
        public DateTime? Contractor_Expiration_date { get; set; }
        [JsonPropertyName("code_Creator_ID")]
        public int Code_Creator_ID { get; set; }
        [JsonPropertyName("code_Has_Been_Used")]
        public Boolean Code_Has_Been_Used { get; set; }
        [JsonPropertyName("new_Emp_Email")]
        public string? New_Emp_Email { get; set; }

    }
}
