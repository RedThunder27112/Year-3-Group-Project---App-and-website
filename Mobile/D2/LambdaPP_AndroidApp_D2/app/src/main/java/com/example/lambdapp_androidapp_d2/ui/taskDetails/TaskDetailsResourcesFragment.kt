package com.example.lambdapp_androidapp_d2.ui.taskDetails

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentTaskDetailsResourcesBinding
import com.example.lambdapp_androidapp_d2.models.Equipment
import com.example.lambdapp_androidapp_d2.models.Stock
import com.example.lambdapp_androidapp_d2.models.Task
import com.example.lambdapp_androidapp_d2.models.Task_Equipment_Bridge
import com.example.lambdapp_androidapp_d2.models.Task_Stock_Bridge
import retrofit2.Call
import retrofit2.Response


class TaskDetailsResourcesFragment : Fragment() {



    private var _binding: FragmentTaskDetailsResourcesBinding? = null

    private lateinit var viewModel: TaskDetailsViewModel

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    private lateinit var btnAddStock: ImageButton
    private lateinit var btnAddEqp: ImageButton
    private lateinit var lblStock : TextView
    private lateinit var lblEquipment : TextView
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTaskDetailsResourcesBinding.inflate(inflater, container, false)
        viewModel = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java]

        btnAddStock = binding.btnAddStock
        btnAddEqp = binding.btnAddEquipment
        lblStock = binding.lblStockText
        lblEquipment = binding.lblEquipmentText

        val taskID = viewModel.getTaskID()
        val taskEqpQuantity = getTaskEquipmentQuantity(taskID)
        val taskStockQuantity = getTaskStockQuantity(taskID)
        viewModel.task.observe(viewLifecycleOwner) { observedTask ->
            taskEqpQuantity.observe(viewLifecycleOwner) { observedTask2 ->
                taskStockQuantity.observe(viewLifecycleOwner) { observedTask3 ->
                    loadEqpAndStock(observedTask,observedTask2,observedTask3)
                }
            }

        }

        btnAddStock.setOnClickListener {
            val result = Bundle()
            result.putInt("taskID", taskID)
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask", result)
            val result2 = Bundle()
            result2.putInt("stockOrEqp", 0)
            requireActivity().supportFragmentManager.setFragmentResult("mode", result2)
            binding.root.findNavController().navigate(R.id.action_nav_taskDetailsParent_to_nav_request)
        }
        btnAddEqp.setOnClickListener {
            val result = Bundle()
            result.putInt("taskID", taskID)
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask", result)
            val result2 = Bundle()
            result2.putInt("stockOrEqp", 1)
            requireActivity().supportFragmentManager.setFragmentResult("mode", result2)
            binding.root.findNavController().navigate(R.id.action_nav_taskDetailsParent_to_nav_request)
        }

        return binding.root
    }

    private fun loadEqpAndStock(observedTask: Task?, observedEquipment: List<Task_Equipment_Bridge>?,observedStock: List<Task_Stock_Bridge>?) {
        if (observedTask != null) {
            //get equipment and stock

            val taskEquipment = getTaskEquipment(observedTask.task_ID)
            taskEquipment.observe(viewLifecycleOwner)
            {
                if (it != null) {
                    var equipmentResponse = ""
                    if (it.isEmpty())
                        equipmentResponse = "No equipment yet!"
                    for (e: Equipment in it)
                    {
                        if (observedEquipment != null) {
                            for(q : Task_Equipment_Bridge in observedEquipment)
                            {
                                if(q.eqp_ID == e.eqp_ID)
                                {
                                    equipmentResponse += e.eqp_Name + ": " + q.quantity_Needed + "\n"
                                }
                            }

                        }
                    }

                    lblEquipment.text = equipmentResponse
                }
            }

            val taskStock = getTaskStock(observedTask.task_ID)
            taskStock.observe(viewLifecycleOwner)
            {
                if (it != null) {
                    var stockResponse = ""
                    if (it.isEmpty())
                        stockResponse = "No stock yet!"
                    for (s: Stock in it)
                    {
                        if (observedStock != null) {
                            for(q : Task_Stock_Bridge in observedStock)
                            {
                                if(q.stock_ID == s.stock_ID)
                                {
                                    stockResponse += s.stock_Name + ": " + q.quantity_Needed + "\n"
                                }
                            }

                        }


                    }

                    lblStock.text = stockResponse
                }
            }
        }
    }

    private fun getTaskEquipment(taskID: Int): LiveData<List<Equipment>>
    {
        val task = MutableLiveData<List<Equipment>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskEquipment( taskID, object : retrofit2.Callback<MutableList<Equipment>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Equipment>>,
                    response: Response<MutableList<Equipment>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Equipment>>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }

    private fun getTaskEquipmentQuantity(taskID: Int): LiveData<List<Task_Equipment_Bridge>>
    {
        val taskEqpQuantity = MutableLiveData<List<Task_Equipment_Bridge>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskEquipmentQuantity( taskID, object : retrofit2.Callback<MutableList<Task_Equipment_Bridge>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Task_Equipment_Bridge>>,
                    response: Response<MutableList<Task_Equipment_Bridge>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Task_Equipment_Bridge>>, t: Throwable) {
                    value = null
                }
            })
        }
        return taskEqpQuantity
    }

    private fun getTaskStock(taskID: Int): LiveData<List<Stock>>
    {
        val task = MutableLiveData<List<Stock>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskStock( taskID, object : retrofit2.Callback<MutableList<Stock>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Stock>>,
                    response: Response<MutableList<Stock>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Stock>>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }

    private fun getTaskStockQuantity(taskID: Int): LiveData<List<Task_Stock_Bridge>>
    {
        val taskStockQuantity = MutableLiveData<List<Task_Stock_Bridge>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskStockQuantity( taskID, object : retrofit2.Callback<MutableList<Task_Stock_Bridge>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Task_Stock_Bridge>>,
                    response: Response<MutableList<Task_Stock_Bridge>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Task_Stock_Bridge>>, t: Throwable) {
                    value = null
                }
            })
        }
        return taskStockQuantity
    }

    override fun onResume() {
        super.onResume()

        val taskID = viewModel.getTaskID()
        val taskEqpQuantity = getTaskEquipmentQuantity(taskID)
        val taskStockQuantity = getTaskStockQuantity(taskID)
        viewModel.task.observe(viewLifecycleOwner) { observedTask ->
            taskEqpQuantity.observe(viewLifecycleOwner) { observedTask2 ->
                taskStockQuantity.observe(viewLifecycleOwner) { observedTask3 ->
                    loadEqpAndStock(observedTask,observedTask2,observedTask3)
                }
            }

        }



    }

}