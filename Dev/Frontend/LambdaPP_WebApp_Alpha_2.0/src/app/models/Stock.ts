export default class Stock {

    stock_ID!: number
    stock_Name!: string
    stock_Description!: string
    stock_Quantity!: number;
    stock_Image!: string;
    stock_Enabled!: boolean;

    constructor(name: string, desc: string, quantity: number)
    {
        this.stock_Name = name
        this.stock_Description = desc
        this.stock_Quantity = quantity
        this.stock_Enabled = true;
    }
}