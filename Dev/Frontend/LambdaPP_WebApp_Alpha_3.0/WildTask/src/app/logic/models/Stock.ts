import Low_Stock from "./Low_Stock";
import TaskStockBridge from "./TaskStockBridge";

export default class Stock {

    stock_ID!: number
    stock_Name!: string
    stock_Description!: string
    stock_Quantity!: number;
    stock_Image!: string;
    stock_Enabled!: boolean;
    stock_Lead_Time!: number;
    task_Stock_Bridges!: TaskStockBridge[];
    Low_Stock: Low_Stock|undefined;

    constructor(name: string, desc: string, quantity: number)
    {
        this.stock_Name = name
        this.stock_Description = desc
        this.stock_Quantity = quantity
        this.stock_Enabled = true;
    }
}