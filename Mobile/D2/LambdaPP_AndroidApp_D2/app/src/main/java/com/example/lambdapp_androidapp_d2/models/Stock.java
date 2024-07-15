package com.example.lambdapp_androidapp_d2.models;

import java.util.List;

public class Stock {
    public int stock_ID ;
    public String stock_Name;
    public String stock_Description;
    public int stock_Quantity;
    public int stock_Lead_Time;
    public boolean stock_Enabled;
    public List<Task_Stock_Bridge> task_Stock_Bridges;
}
