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
}