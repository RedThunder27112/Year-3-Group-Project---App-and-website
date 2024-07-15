import { DateService } from "../../helpers/GetDates"

export default class Activity 
{
    act_ID = 0
    act_Name!: string
    act_Description!: string
    act_Creation_Date!: any
    tasks!: null
    act_Recommended_Min_Emps_Per_Task!: number
    act_Recommended_Max_Emps_Per_Task!: number
    act_Recommended_Max_Tasks_Per_Emp!: number

    constructor(name: string, desc: string)
    {
        this.act_Name = name
        this.act_Description = desc
        this.act_Creation_Date = DateService.getUTCDate(new Date());
        this.tasks = null
    }
}