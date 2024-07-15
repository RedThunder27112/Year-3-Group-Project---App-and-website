using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "task requests" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database.
    //Will need to make models for all other tables we want to access - Gage
    public class Request_Skill
    {
        [Key]
        [JsonPropertyName("req_Skill_ID")]
        public int Req_Skill_ID { get; set; }


        [JsonPropertyName("emp_ID")]
        public int Emp_ID { get; set; }

        [JsonPropertyName("skill_ID")]
        public int Skill_ID { get; set; }


        [JsonPropertyName("req_Skill_Approval_State")]
        public int Req_Skill_Approval_State { get; set; }


        [JsonPropertyName("req_Skill_Level")]
        public int Req_Skill_Level { get; set; }

        [JsonPropertyName("req_Skill_Doc_Name")]
        public string Req_Skill_Doc_Name { get; set; }

        [JsonPropertyName("req_Skill_Has_Doc")]
        public int Req_Skill_Has_Doc { get; set; }



    }
    /*
     [Req_ID] INT NOT NULL PRIMARY KEY, 
    [Task_ID] INT NOT NULL, 
    [Req_Type] VARCHAR(50) NOT NULL, 
	[Req_Request] VARCHAR(MAX) NOT NULL,
    [Req_Description] VARCHAR(1000) NULL, 
    [Req_Approval] INT NULL, */
}
