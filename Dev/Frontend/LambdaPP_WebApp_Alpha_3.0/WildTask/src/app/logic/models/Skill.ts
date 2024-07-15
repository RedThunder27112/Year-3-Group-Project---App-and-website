import Employee_Skill_Bridge from "./Employee_Skill_Bridge";

export default class Skill
{
    skill_ID: number | null;
    skill_Name: string;
    skill_Description: string;
    skill_Enabled: boolean;
    Employee_Skill_Bridges: Employee_Skill_Bridge[] | undefined;
    
    constructor();
    constructor(name?: string, description?: string)
    {
        this.skill_ID = null;
        if (name) this.skill_Name = name;
        else this.skill_Name = "";
        if (description) this.skill_Description = description;
        else this.skill_Description = "";
        this.skill_Enabled = true;
    }
}