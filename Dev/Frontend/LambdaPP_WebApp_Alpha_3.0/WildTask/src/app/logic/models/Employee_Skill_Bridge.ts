import Employee from "./Employee"
import Skill from "./Skill"

export default class Employee_Skill_Bridge
{
    emp_ID: number
    
    employee: Employee|null
    
    skill_ID: number

    skill: Skill|null

    skill_Level: number
    
    eS_Enabled: Boolean 

    constructor();
    constructor()
    {
        this.emp_ID = 0;
        this.employee = null;
        this.skill_ID = 0;
        this.skill = null;
        this.skill_Level = 0;
        this.eS_Enabled = true;
    }
    
}