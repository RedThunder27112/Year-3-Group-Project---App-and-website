package com.example.lambdapp_androidapp_d2.models;

import java.util.List;

public class Task {
    public int task_ID;
    public int act_ID;
    public Activity activity;
    public String task_Name;
    public String task_Date_Started;
    public String task_Deadline;
    public String task_Description;
    public int status_ID;
    public Task_Status status;
    public boolean task_Enabled;
    public List<Task_Employee_Bridge> task_employee_bridges;
    public List<Employee> employees;
    public List<Task_Equipment_Bridge> Task_Equipment_Bridges;
    public List<Equipment> equipments;
    public List<Task_Update> Task_Updates;

}
