import Activity from "./Activity";
import { DateService } from "../helpers/GetDates"

export default class Task
{
    task_ID!: number | null;
    act_ID!: number;
    activity!: Activity;
    task_Name!: string;
    task_Date_Started!: any;
    task_Deadline!: any;
    task_Description!: string;
    status_ID: number;
    task_Enabled: boolean;
    act_Name!: string;
    
    constructor(act: number, name: string, description: string, startDate: Date, deadline: Date)
    {
        this.task_ID = null;
        this.task_Name = name;
        this.act_ID = act;
        this.task_Description = description;
        this.task_Date_Started = DateService.getUTCDate(startDate);
        this.task_Deadline = DateService.getUTCDate(deadline);
        this.status_ID = 1; // right now we're assuming that the status is 1 - in progress
        this.task_Enabled = true;
    }
}
