export default class Equipment
{
    eqp_ID!: number
    eqp_Name!: string
    eqp_Description!: string
    eqp_Quantity_Total!: number
    eqp_Image!: string
    eqp_Enabled!: boolean;

    constructor(name: string, desc: string, quantity: number)
    {
        this.eqp_Name = name
        this.eqp_Description = desc
        this.eqp_Quantity_Total = quantity
        this.eqp_Enabled = true;
    }
}