export default class Request 
{
    req_ID!: number
    task_ID!: number
    task!: null
    emp_ID!: number
    req_Type!: string
    req_Request!: string
    req_Description!: string
    req_Approval!: 0

    employee!: any | null
}