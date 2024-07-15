using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    [PrimaryKey(nameof(Task_ID), nameof(Skill_ID))]
    public class Task_Skill_Bridge
    {
        [JsonPropertyName("task_ID")]
        public int Task_ID { get; set; }
        [JsonPropertyName("task")]
        public LambdaPP_WebAPI_Alpha.Database.Models.Task? task { get; set; }
        [JsonPropertyName("skill_ID")]
        public int Skill_ID { get; set; }
        [JsonPropertyName("skill")]
        public Skill? skill { get; set; }
        [JsonPropertyName("skill_Level")]
        public int Skill_Level { get; set; }

        [JsonPropertyName("tSk_Enabled")]
        public Boolean TSk_Enabled { get; set; }

    }
}
