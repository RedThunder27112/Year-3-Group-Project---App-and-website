import { DateService } from "../../helpers/GetDates"

export default class Activity 
{
   Req_ID: number
   Task_ID : number
   Emp_ID: number
   Req_Type: string
   Req_Request : string
   Req_Description : string
   Req_Approval : boolean

    constructor()
    {
        this.Req_ID = 0
        this.Task_ID = 0
        this.Emp_ID = 0
        this.Req_Type = ""
        this.Req_Request = ""
        this.Req_Description = ""
        this.Req_Approval = false
    }
}