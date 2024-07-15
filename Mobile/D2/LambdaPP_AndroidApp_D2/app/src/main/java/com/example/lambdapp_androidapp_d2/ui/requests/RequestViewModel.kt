package com.example.lambdapp_androidapp_d2.ui.requests

import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.models.Equipment
import com.example.lambdapp_androidapp_d2.models.Stock

public class RequestViewModel : ViewModel() {

    private var _stocksToRequest = ArrayList<StockPlusQuantity>()
    public var stocksToRequest = _stocksToRequest
    private var _eqpToRequest = ArrayList<EqpPlusQuantity>()
    public var eqpToRequest = _eqpToRequest
    private var _taskid: Int = -1
    public var taskID = _taskid
    //0 is stock, 1 is equipment
    public var mode = -1


}

public class StockPlusQuantity(public var stock: Stock,  public var quantity: Int)
{
}
public class EqpPlusQuantity(public var equipment: Equipment,  public var quantity: Int)
{
}