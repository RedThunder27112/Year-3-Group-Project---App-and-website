import { DateService } from 'src/app/helpers/generateCurrDate';

export default class Employee
{
    emp_ID: number|null;
    emp_Username: string;
    emp_Password: string;
    emp_Name: string;
    emp_Sur: string;
    emp_ID_Image: any; // not sure how to handle images yet
    emp_IsAdmin: boolean;
    emp_IsContractor: boolean;
    emp_DateRegistered: string;
    emp_Enabled: boolean;
    ratingsGiven: any;
    skills: any;
    task_Updates: any;
    tasks: any;
    
    constructor(name: string, surname: string, username: string, password: string)
    {
        this.emp_ID = null;
        this.emp_Username = username;
        this.emp_Password = password;
        this.emp_Name = name;
        this.emp_Sur = surname;
        this.emp_IsAdmin = true;
        this.emp_IsContractor = false;
        this.emp_DateRegistered = DateService.getCurrentDate().toString();
        this.emp_Enabled = true;
    }
}