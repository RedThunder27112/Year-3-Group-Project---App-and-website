using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    [PrimaryKey(nameof(Template_ID), nameof(Skill_ID))]
    public class Task_Template_Skill_Bridge
    {
        [JsonPropertyName("template_ID")]
        public int Template_ID { get; set; }
        [JsonPropertyName("template")]
        public Task_Template? Template { get; set; }
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
