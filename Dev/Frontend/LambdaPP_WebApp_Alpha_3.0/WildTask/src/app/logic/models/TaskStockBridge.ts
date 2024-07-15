export default class TaskStockBridge {

    task_ID!: number
    stock_ID!: number
    quantity_Needed!: number;
    quantity_Used!: number;
    ts_Enabled!: boolean;


    constructor()
    {
        this.ts_Enabled = true;
    }
}