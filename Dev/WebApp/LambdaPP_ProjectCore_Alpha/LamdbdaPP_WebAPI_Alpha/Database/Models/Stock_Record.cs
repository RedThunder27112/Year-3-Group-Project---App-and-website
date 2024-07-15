using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    //This is a model of the "Stock_Record" table. It has to match up exactly with the data in the database,
    //in order for the DbContext to work properly!
    //This is what will be returned by the DBContext when it accesses the database - Gage
    public class Stock_Record
    {
        [Key]
        [JsonPropertyName("record_ID")]
        public int Record_ID { get; set; }

        [JsonPropertyName("stock_ID")]
        public int Stock_ID { get; set; }

        [JsonPropertyName("record_Amount")]
        public int Record_Amount { get; set; }

        [JsonPropertyName("record_Date")]
        public DateTime Record_Date { get; set; }
    }
}
