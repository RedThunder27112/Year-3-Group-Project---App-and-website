package com.example.lambdapp_androidapp_d2.ui.requests

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentRequestBinding
import com.example.lambdapp_androidapp_d2.models.Task_Request
import com.example.lambdapp_androidapp_d2.ui.taskDetails.TaskDetailsViewModel
import retrofit2.Call
import retrofit2.Response

/**
 * A simple Fragment subclass.
 * Use the RequestFragment.newInstance factory method to
 * create an instance of this fragment.
 */
class RequestFragment : Fragment() {


    private var _binding: FragmentRequestBinding? = null
    private lateinit var requestVM: RequestViewModel
    private lateinit var btnAddStocks: Button

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    private lateinit var stockList: LinearLayout

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentRequestBinding.inflate(inflater, container, false)

        val root: View = binding.root

        btnAddStocks = binding.btnAddStocks
        val btnPostRequest = binding.btnPostRequest
        val loadingProgressBar = binding.progressBar
        stockList = binding.stockList

        requestVM = ViewModelProvider(requireActivity())[RequestViewModel::class.java]

        //may do this multiple times if we change mode from stock mode to equipment mode, so listen if it changes, but it may not
        requireActivity().supportFragmentManager.setFragmentResultListener("mode",this
        ) { _: String, Result: Bundle ->
            requestVM.mode = Result.getInt("stockOrEqp")
            //if equipment mode, change headings
            if (requestVM.mode == 1)
                enableEquipmentMode(btnAddStocks, root)


        }
        //if taskID is -1, this is the first time going onto this page
        if (requestVM.taskID==-1)
        {
            requestVM.taskID = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java].getTaskID()
        }
        else
        {
            if (requestVM.mode==1) {
                enableEquipmentMode(btnAddStocks, root)
                for (e: EqpPlusQuantity in requestVM.eqpToRequest)
                    DisplayEqp(e)
            }
                else
                //display the stock in the VM, allow it to be removed
                for(s: StockPlusQuantity in requestVM.stocksToRequest)
                    DisplayStock(s)
        }


        btnAddStocks.setOnClickListener {
            if (requestVM.mode==1)
                root.findNavController().navigate(R.id.action_nav_request_to_nav_request_Equipment)
            else
                root.findNavController().navigate(R.id.action_nav_request_to_nav_request_stock)
        }

        btnPostRequest.setOnClickListener{
            //post the request to the api
            val request = Task_Request()
            request.task_ID = requestVM.taskID
            var requestBody = ""
            var requestDescr: String
            if (requestVM.mode==0)
            {
                request.req_Type = "stock"
                requestDescr = "Stock request for task " + request.task_ID + ":\n"
                for(s: StockPlusQuantity in requestVM.stocksToRequest)
                {
                    requestBody += s.stock.stock_ID.toString() + " " + s.quantity + "\n"
                    requestDescr += s.stock.stock_Name + " : " + " " + s.quantity + "\n"
                }
            }
            else if (requestVM.mode==1)
            {
                request.req_Type = "eqp"
                requestDescr = "Equipment request for task " + request.task_ID + ":\n"
                for(s: EqpPlusQuantity in requestVM.eqpToRequest)
                {
                    requestBody += s.equipment.eqp_ID.toString() + " " + s.quantity + "\n"
                    requestDescr += s.equipment.eqp_Name + " : " + " " + s.quantity + "\n"
                    Log.i("StockReq", requestBody)
                }
            }
            else {
                Toast.makeText(
                    this.context,
                    "Error: not clear whether stock or eqp",
                    Toast.LENGTH_LONG
                ).show()
                return@setOnClickListener
            }

            request.req_Request = requestBody
            request.req_Description =requestDescr
            request.emp_ID = LoginRepository.getInstance()?.user?.userId ?: -1
            //create the connection manager
            val conManager = ApiConnectionManager()

            conManager.postRequest(request, object : retrofit2.Callback<Task_Request> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Task_Request>,
                    response: Response<Task_Request>
                ) {
                    loadingProgressBar.visibility = View.GONE
                    //check if the response was successful
                    if (response.isSuccessful) {
                        goBack()
                        requestVM.eqpToRequest.clear()
                        requestVM.stocksToRequest.clear()
                    } else {
                        val appContext = context?.applicationContext ?: return
                        Toast.makeText(appContext, "Error posting update", Toast.LENGTH_LONG)
                            .show()
                        requestVM.eqpToRequest.clear()
                        requestVM.stocksToRequest.clear()
                    }
                }



                //failure - an exception t was encountered
                override fun onFailure(call: Call<Task_Request>, t: Throwable) {
                    loadingProgressBar.visibility = View.GONE
                    val appContext = context?.applicationContext ?: return
                    Toast.makeText(appContext, "Error: " + t.message, Toast.LENGTH_LONG).show()
                }
            })
        }


        return binding.root

    }

    private fun enableEquipmentMode(btnAddStocks: Button, root: View) {
        val txtheading = binding.txtStockHeading
        txtheading.text = getString(R.string.equipment_heading)
        btnAddStocks.text = getString(R.string.add_equipment_button)
        btnAddStocks.setOnClickListener {
            root.findNavController().navigate(R.id.action_nav_request_to_nav_request_Equipment)
        }
    }

    private fun DisplayStock(s: StockPlusQuantity) {
        val txtStock = TextView(this.context)
        //below code means txtStock.text = s.stock.stock_Name + "  " + s.quantity
        "${s.stock.stock_Name}  ${s.quantity}".also { txtStock.text = it }
        stockList.addView(txtStock,0)
    }

    private fun DisplayEqp(e: EqpPlusQuantity) {
        val txtEqp = TextView(this.context)
        //below code means txtStock.text = s.stock.stock_Name + "  " + s.quantity
        "${e.equipment.eqp_Name}  ${e.quantity}".also { txtEqp.text = it }
        stockList.addView(txtEqp,0)
    }

    private fun goBack() {
        /*val result2 = Bundle()
        result2.putInt("taskID", taskID)
        parentFragmentManager.setFragmentResult("selectedTask", result2)
        binding.root.findNavController()
            .navigate(R.id.action_nav_request_to_nav_taskDetailsParent)*/
        binding.root.findNavController().popBackStack()
    }



}