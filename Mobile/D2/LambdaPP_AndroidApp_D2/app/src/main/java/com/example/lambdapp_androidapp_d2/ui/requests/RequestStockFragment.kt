package com.example.lambdapp_androidapp_d2.ui.requests

import android.os.Bundle
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
import com.example.lambdapp_androidapp_d2.databinding.FragmentRequestStockBinding
import com.example.lambdapp_androidapp_d2.models.Stock
import retrofit2.Call
import retrofit2.Response


class RequestStockFragment : Fragment() {

    private var _binding: FragmentRequestStockBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    private lateinit var selectedStock: Stock
    private lateinit var txtStockName: TextView
    private lateinit var txtQuantity: EditText

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentRequestStockBinding.inflate(inflater, container, false)

        val root: View = binding.root

        val btnRequestStock = binding.btnRequest
        txtStockName = binding.txtStockName
        txtQuantity = binding.txtQuantity


        val requestVM: RequestViewModel = ViewModelProvider(requireActivity())[RequestViewModel::class.java]

        btnRequestStock.setOnClickListener {
            //on click, record and navigate back
            if (txtQuantity.text.isBlank())
            {
                Toast.makeText(this.context,"Quantity is required",Toast.LENGTH_LONG).show()
            }
            else
            {
                val quantity: Int = Integer.valueOf(txtQuantity.text.toString())
                requestVM.stocksToRequest.add(StockPlusQuantity(selectedStock,quantity))
                root.findNavController().popBackStack()
            }
        }


        val recyclerView: RecyclerView = binding.stockRecycler

        //observe the stock live data
        val stock = getStock()
        stock.observe(viewLifecycleOwner)
        {
            if (it != null) {
                if (it.isEmpty())
                    Toast.makeText(this.context,"No stock found!",Toast.LENGTH_LONG).show()
                else{
                    recyclerView.layoutManager =
                        GridLayoutManager(this.requireContext(),2)
                    //recyclerView.adapter = TimeLineAdapter(it, requireActivity().supportFragmentManager)
                    val stockAdapter = StockAdapter(){ stock -> adapterOnClick(stock)}
                    recyclerView.adapter = stockAdapter
                    stockAdapter.submitList(it as MutableList<Stock>)
                }
            }
        }
        return binding.root

    }

    private fun adapterOnClick(stock: Stock) {
        //on click, we want to select that stock item for the request
        selectedStock = stock
        txtStockName.text = selectedStock.stock_Name
        txtQuantity.hint = selectedStock.stock_Quantity.toString()
        txtQuantity.text.clear()
    }

    /*override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val afterTextChangedListener = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
                // ignore
            }
            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                // ignore
            }
            override fun afterTextChanged(s: Editable) {
            }
        }
    }*/

    private fun getStock(): LiveData<List<Stock>>
    {
        val stocks = MutableLiveData<List<Stock>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getAllStock(object : retrofit2.Callback<MutableList<Stock>> {
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
        return stocks
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
