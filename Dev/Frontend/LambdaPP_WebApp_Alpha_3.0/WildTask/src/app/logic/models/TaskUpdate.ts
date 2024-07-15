import Employee from "./Employee";

export default class TaskUpdate 
{
    update_ID!: number
    task_ID!: number
    emp_ID!: number
    update_Time: any;
    update_Description!: string;
    update_Status!: string;
    update_Location!: string | null;
    employee!: Employee
    update_Picture!: any | null

    up_Lat!: any | null
    up_Long!: any | null
}