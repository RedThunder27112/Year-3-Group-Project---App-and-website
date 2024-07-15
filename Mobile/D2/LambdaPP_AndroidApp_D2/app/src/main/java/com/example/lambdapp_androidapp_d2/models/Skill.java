package com.example.lambdapp_androidapp_d2.models;

import java.util.List;

public class Skill {
    public int skill_ID;
    public String skill_Name;
    public String skill_Description;
    public boolean skill_Enabled;
    public List<Employee_Skill_Bridge> employee_Skill_Bridges;
    //public List<Employee> employees;
    public List<Task_Skill_Bridge> task_Skill_Bridges;
    //public List<Task>? tasks;
}
