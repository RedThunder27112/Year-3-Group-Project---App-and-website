package com.example.lambdapp_androidapp_d2.models;

/*NOTE FOR FUTURE BUGFIXING:
* if you aren't getting the response you expect, make sure that the names of the attributes all start lowercase
* eg temperatureC, not TemperatureC
* EVEN IF IN THE API MODEL, IT STARTS WITH A CAPITAL!!!
* JSON just turns it lowercase
* UPDATE: just make sure it matches the json property name in the API, eg: [JsonPropertyName("status_ID")]
* */

public class WeatherForecast {
    public String date;
    public Integer temperatureC;
    public Integer temperatureF;
    public String summary;
}
