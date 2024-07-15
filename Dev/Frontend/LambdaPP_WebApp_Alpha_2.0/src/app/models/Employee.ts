import { Observable } from 'rxjs';
import { DateService } from 'src/app/helpers/GetDates';

export default class Employee
{
    emp_ID: number | null;
    emp_Username: string;
    emp_Password: string;
    emp_Name: string;
    emp_Sur: string;
    emp_IsAdmin!: boolean;
    emp_IsContractor!: boolean;
    emp_DateRegistered: any;
    emp_Enabled: boolean;
    task_Employee_Bridges!: null;
    tasks!: null;
    ratingsGiven!: null;
    employee_Skill_Bridges!: null;
    skills!: null;
    task_Updates!: null;
    emp_Role = "Employee";
    emp_ID_Image!: string;
    
    constructor(name: string, surname: string, username: string, password: string, role: string)
    {
        this.emp_ID = null;
        this.emp_Username = username;
        this.emp_Password = password;
        this.emp_Name = name;
        this.emp_Sur = surname;

        // setting roles
        if(role == "Administrator")
        {
            this.emp_IsAdmin = true;
            this.emp_IsContractor = false;
        }
        else if(role == "Contractor")
        {
            this.emp_IsAdmin = false;
            this.emp_IsContractor = true;
        }

        this.emp_DateRegistered = DateService.getUTCDate(new Date());
        this.emp_Enabled = true;
    }
}