import { DateService } from "../../helpers/GetDates"

export default class SavedLocation 
{
    loc_ID = 0
    loc_Name!: string
    loc_Coordinates!: string
   
    constructor(loc_Name: string, loc_Coordinates: string)
    {
        this.loc_Name = loc_Name
        this.loc_Coordinates = loc_Coordinates
    }
}