package com.example.lambdapp_androidapp_d2.models;

import java.util.List;

public class Notification
{
    public int not_ID;
    public int emp_ID;
    public int task_ID;
    public String not_Description;
    public String not_Date;
    public List<Task_Equipment_Bridge> task_Equipment_Bridges;
    public List<Task> tasks;
    public boolean not_Viewed;
}

