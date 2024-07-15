import { DateService } from '../../helpers/GetDates';
import Employee_Skill_Bridge from './Employee_Skill_Bridge';
import Rating from './Rating';

export default class Employee
{
    emp_ID: number | null;
    emp_Username: string;
    emp_Password: string | null;
    emp_Name: string;
    emp_Sur: string;
    emp_IsAdmin!: boolean;
    emp_IsContractor!: boolean;
    emp_DateRegistered: any;
    emp_Enabled: boolean;
    task_Employee_Bridges!: null;
    tasks!: null;
    ratingsGiven: Rating[]|undefined;
    employee_Skill_Bridges: Employee_Skill_Bridge[]|undefined;
    skills!: null;
    task_Updates!: null;
    emp_Role: String;
    emp_ID_Image!: string;
    emp_Rating!: number
    emp_IsReco: boolean = false
    emp_Reason: string = ""
    emp_IsReason: boolean = false

    emp_AvgRatingsPM: any[] = []
    
    constructor(name: string, surname: string, username: string, password: string | null, role: string)
    {
        this.emp_ID = null;
        this.emp_Username = username;
        this.emp_Password = password;
        this.emp_Name = name;
        this.emp_Sur = surname;

        // setting roles
        if(role == "Administrator")
        {
            this.emp_Role = "Administrator";
            this.emp_IsAdmin = true;
            this.emp_IsContractor = false;
        }
        else if(role == "Contractor")
        {
            this.emp_Role = "Contractor";
            this.emp_IsAdmin = false;
            this.emp_IsContractor = true;
        }
        else
        {
            this.emp_Role = "Employee";
            
            this.emp_IsAdmin = false;
            this.emp_IsContractor = false;
        }

        this.emp_DateRegistered = DateService.getUTCDate(new Date());
        this.emp_Enabled = true;
    }
}