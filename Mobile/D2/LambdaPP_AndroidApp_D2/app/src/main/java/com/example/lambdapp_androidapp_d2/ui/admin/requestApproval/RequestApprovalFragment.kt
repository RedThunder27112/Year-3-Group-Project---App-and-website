package com.example.lambdapp_androidapp_d2.ui.admin.requestApproval

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.lambdapp_androidapp_d2.databinding.FragmentRequestApprovalBinding
import com.example.lambdapp_androidapp_d2.models.Task_Request

class RequestApprovalFragment : Fragment() {


    private var _binding: FragmentRequestApprovalBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: RequestApprovalViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRequestApprovalBinding.inflate(inflater, container, false)
        viewModel = ViewModelProvider(this)[RequestApprovalViewModel::class.java]

        //default display of requests
        viewModel.currentRequests.observe(viewLifecycleOwner) { requests ->
            if (requests != null)
                showRequests(requests, binding.requestRecycler)
        }

        return binding.root
    }

    private fun showRequests(it: List<Task_Request>, recyclerView: RecyclerView)
    {
        if (it.isNotEmpty())
        {
            recyclerView.layoutManager =
                LinearLayoutManager(this.requireContext())
            //recyclerView.adapter = TimeLineAdapter(it, requireActivity().supportFragmentManager)
            val reqAdapter = RequestApprovalAdapter()
            recyclerView.adapter = reqAdapter
            reqAdapter.submitList(it as MutableList<Task_Request>)
        }
    }

}