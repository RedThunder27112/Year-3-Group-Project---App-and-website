export default class Skill
{
    skill_ID: Number|null;
    skill_Name: string;
    skill_Description: string;
    skill_Enabled: boolean;
    //selected: boolean;
    //employees? tasks?
    
    constructor();
    constructor(name?: string, description?: string)
    {
        this.skill_ID = null;
        if (name) this.skill_Name = name;
        else this.skill_Name = "";
        if (description) this.skill_Description = description;
        else this.skill_Description = "";

        //this.selected = false;
        this.skill_Enabled = true;
    }

}