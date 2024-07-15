using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "task requests" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Task_Request
    {
        [Key]
        [JsonPropertyName("req_ID")]
        public int Req_ID { get; set; }
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }
        [JsonPropertyName("task")]
        public Task? Task { get; set; }
        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }
        [JsonPropertyName("req_Type")]
        public string? Req_Type { get; set; }
        [JsonPropertyName("req_Request")]
        public string? Req_Request { get; set; }
        [JsonPropertyName("req_Description")]
        public string? Req_Description { get; set; }
        [JsonPropertyName("req_Approval")]
        public int Req_Approval { get; set; }

        [JsonPropertyName("req_Date")]
        public DateTime Req_Date { get; set; }
        

    }
    /*
     [Req_ID] INT NOT NULL PRIMARY KEY, 
    [Task_ID] INT NOT NULL, 
    [Req_Type] VARCHAR(50) NOT NULL, 
	[Req_Request] VARCHAR(MAX) NOT NULL,
    [Req_Description] VARCHAR(1000) NULL, 
    [Req_Approval] INT NULL, */
}
