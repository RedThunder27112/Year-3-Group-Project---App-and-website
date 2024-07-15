import Skill from "./Skill";

export default class Task
{
    task_ID: Number|null;
    act_ID: Number;
    task_Name: string;
    task_Date_Started: string|null;
    task_Deadline: string|null;
    task_Description: string;
    status_ID: Number;
    task_Enabled: boolean;
    skills: Skill[]|null;
    //employees? equipment? stock?
    
    constructor();
    constructor(name?: string, act?: Number, description?: string)
    {
        this.task_ID = null;
        if (name) this.task_Name = name;
        else this.task_Name = "";
        if (act) this.act_ID = act;
        else this.act_ID = 1;
        if (description) this.task_Description = description;
        else this.task_Description = "";

        this.task_Date_Started = null;
        this.task_Deadline = null;
        this.skills = null;

        //todo: right now we're assuming that the status is 1 - in progress
        this.status_ID = 1;
        //this.emp_DateRegistered = DateService.getCurrentDate().toString();
        this.task_Enabled = true;
    }

   
    //todo: Other constructors that set the date started, deadline, employees etc.
}