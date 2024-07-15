package com.example.lambdapp_androidapp_d2.models;

import android.media.Image;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.sql.Date;
import java.util.List;

public class Employee {
    public int emp_ID;
    public String emp_Username;
    public String emp_Password;
    public String emp_Name;
    public String emp_Sur;
    public Boolean emp_IsAdmin = false;
    public Boolean emp_IsContractor = false;
    // public Image? Emp_ID_Image;
    public byte[] emp_ID_Image;
    public String emp_DateRegistered;
    public Boolean emp_Enabled = true;
    public List<Task_Employee_Bridge> task_employee_bridges;
    public List<Task> tasks;
    //note: these are the ratings they have GIVEN, not received
    public List<Rating> ratingsGiven;
    public List<Employee_Skill_Bridge> employee_Skill_Bridges;
    public List<Skill> skills;
    public List<Task_Update> task_Updates;
    public double emp_Rating;

}
