import Employee from "./Employee"
import Task from "./Task"

export default class Request 
{
    rating_ID!: number
    emp_ID!: number
    reviewer_ID!: number
    
    employee!: Employee | null
    reviewer!: Employee | null

    task_ID!: number
    task!: Task | null

    rating_Rating!: number
    rating_Date!: string
    rating_Comment: string | null = null

    rating_Category!: number|null
}