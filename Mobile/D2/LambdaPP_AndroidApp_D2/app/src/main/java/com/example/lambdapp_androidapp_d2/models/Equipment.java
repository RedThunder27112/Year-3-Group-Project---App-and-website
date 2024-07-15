package com.example.lambdapp_androidapp_d2.models;

import java.util.List;

public class Equipment {
    public int eqp_ID;
    public String eqp_Name;
    public String eqp_Description;
    public int eqp_Quantity_Total;
    public boolean eqp_Enabled;
    public List<Task_Equipment_Bridge> task_Equipment_Bridges;
    public List<Task> tasks;
}
