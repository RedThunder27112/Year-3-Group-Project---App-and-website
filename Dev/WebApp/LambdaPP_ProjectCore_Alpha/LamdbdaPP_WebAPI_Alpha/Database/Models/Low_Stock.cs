using LamdbdaPP_WebAPI_D3.Database.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    public class Low_Stock
    {

        [JsonPropertyName("stock_ID")]
        public int Stock_ID { get; set; }

        [JsonPropertyName("week")]
        public bool Week { get; set; }

        [JsonPropertyName("bi_Week")]
        public bool Bi_Week { get; set; }

        [JsonPropertyName("month")]
        public bool Month { get; set; }

        [JsonPropertyName("stock_Quantity")]
        public int Stock_Quantity { get; set; }

        [JsonPropertyName("usage_Weekly")]
        public int Usage_Weekly { get; set; }

        [JsonPropertyName("usage_Bi_Weekly")]
        public int Usage_Bi_Weekly { get; set; }

        [JsonPropertyName("usage_Monthly")]
        public int Usage_Monthly { get; set; }


    }
}
