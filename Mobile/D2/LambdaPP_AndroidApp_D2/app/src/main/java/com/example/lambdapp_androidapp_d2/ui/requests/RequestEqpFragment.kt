package com.example.lambdapp_androidapp_d2.ui.requests

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentRequestEquipmentBinding
import com.example.lambdapp_androidapp_d2.models.Equipment
import retrofit2.Call
import retrofit2.Response

class RequestEqpFragment : Fragment() {

    private var _binding: FragmentRequestEquipmentBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    private lateinit var selectedEqp: Equipment
    private lateinit var txtEqpName: TextView
    private lateinit var txtQuantity: EditText

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentRequestEquipmentBinding.inflate(inflater, container, false)

        val root: View = binding.root

        val btnRequestEqp = binding.btnRequestEqp
        txtEqpName = binding.txtEqpName
        txtQuantity = binding.txtQuantityEqp


        val requestVM: RequestViewModel = ViewModelProvider(requireActivity())[RequestViewModel::class.java]

        btnRequestEqp.setOnClickListener {
            //on click, record and navigate back
            if (txtQuantity.text.isBlank())
            {
                Toast.makeText(this.context,"Quantity is required", Toast.LENGTH_LONG).show()
            }
            else
            {
                val quantity: Int = Integer.valueOf(txtQuantity.text.toString())
                requestVM.eqpToRequest.add(EqpPlusQuantity(selectedEqp,quantity))
                root.findNavController().popBackStack()
            }
        }


        val recyclerView: RecyclerView = binding.eqpRecycler

        //observe the equipment live data
        val eqp = geteqp()
        eqp.observe(viewLifecycleOwner)
        {
            if (it != null) {
                if (it.isEmpty())
                    Toast.makeText(this.context,"No equipment found!", Toast.LENGTH_LONG).show()
                else{
                    recyclerView.layoutManager =
                        GridLayoutManager(this.requireContext(),2)
                    //recyclerView.adapter = TimeLineAdapter(it, requireActivity().supportFragmentManager)
                    val eqpAdapter = EqpAdapter { eqp -> adapterOnClick(eqp)}
                    recyclerView.adapter = eqpAdapter
                    eqpAdapter.submitList(it as MutableList<Equipment>)
                }
            }
        }
        return binding.root

    }

    private fun adapterOnClick(eqp: Equipment) {
        //on click, we want to select that equipment item for the request
        selectedEqp = eqp
        txtEqpName.text = selectedEqp.eqp_Name
        txtQuantity.hint = selectedEqp.eqp_Quantity_Total.toString()
        txtQuantity.text.clear()
    }

    private fun geteqp(): LiveData<List<Equipment>>
    {
        val equipment = MutableLiveData<List<Equipment>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getAllEquipment(object : retrofit2.Callback<MutableList<Equipment>> {
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
        return equipment
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}