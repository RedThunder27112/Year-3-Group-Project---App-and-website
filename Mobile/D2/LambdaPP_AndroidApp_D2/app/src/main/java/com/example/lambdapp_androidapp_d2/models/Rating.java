package com.example.lambdapp_androidapp_d2.models;

public class Rating {
    public int rating_ID;
    public int tEBridge_ID;
    public Task_Employee_Bridge task_Employee_Bridge;
    public int rating_Rating;
    public int reviewer_ID;
    public Employee reviewer;
    public String rating_Comment;
    public String rating_Date;
    public int task_ID;
    public int emp_ID;//this is the person being rated, their score
}
