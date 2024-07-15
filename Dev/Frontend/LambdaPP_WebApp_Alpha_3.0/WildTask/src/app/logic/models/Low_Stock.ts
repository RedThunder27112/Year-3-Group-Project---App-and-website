export default class Low_Stock {

    stock_ID!: number
    week: Boolean = false
    bi_Week: Boolean = false
    month: Boolean = false;
    stock_Quantity!: number;
    usage_Weekly!: number;
    usage_Bi_Weekly!: number;
    usage_Monthly!: number;

    constructor(quantity: number)
    {
        this.stock_Quantity = quantity
    }
}