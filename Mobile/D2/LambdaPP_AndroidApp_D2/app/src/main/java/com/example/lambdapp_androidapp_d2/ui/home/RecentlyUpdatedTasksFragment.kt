package com.example.lambdapp_androidapp_d2.ui.home

import android.icu.text.SimpleDateFormat
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentRecentlyUpdatedTasksBinding
import com.example.lambdapp_androidapp_d2.models.Task
import java.util.*


class RecentlyUpdatedTasksFragment : Fragment() {

    private var _binding: FragmentRecentlyUpdatedTasksBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private lateinit var homeViewModel: HomeViewModel

    private var sDateFrom: String = ""
    private var sDateTo: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        homeViewModel =
            ViewModelProvider(requireActivity())[HomeViewModel::class.java]

        _binding = FragmentRecentlyUpdatedTasksBinding.inflate(inflater, container, false)
        val linearLayout = binding.innerLayout
        val btnClearFilter = binding.btnFilterDates
        val txtDateFrom = binding.txtDateFrom
        val txtDateTo = binding.txtDateTo

        //display of tasks
        homeViewModel.recentlyUpdatedTasks.observe(viewLifecycleOwner) { tasks ->
            if (tasks != null)
                showTasks(tasks, linearLayout)
            else
            {
                linearLayout.removeAllViews()
                homeViewModel.showText("Loading...", linearLayout, requireContext())
            }
        }

        //handling date filtering
        btnClearFilter.visibility = View.INVISIBLE


        txtDateFrom.setOnClickListener{
            //save the date and filter
            val fromDatePicker = homeViewModel.initDatePicker(txtDateFrom,requireContext())
            { year: Int, month: Int, day: Int ->
                sDateFrom = "$day $month $year"
                tryFilterByDates(linearLayout)
                btnClearFilter.visibility = View.VISIBLE
            }
            //if the "to" date has already been set, make that the max selectable date
            if (sDateTo.isNotEmpty())
                fromDatePicker.datePicker.maxDate = SimpleDateFormat("dd MM yyyy", Locale.ENGLISH).parse(sDateTo).time
            fromDatePicker.show()}


        txtDateTo.setOnClickListener{
            val toDatePicker = homeViewModel.initDatePicker(txtDateTo,requireContext())
            { year: Int, month: Int, day: Int ->
                sDateTo = "$day $month $year"
                tryFilterByDates(linearLayout)
                btnClearFilter.visibility = View.VISIBLE
            }
            //if the "from" date has already been set, make that the min selectable date
            if (sDateFrom.isNotEmpty())
                toDatePicker.datePicker.minDate = SimpleDateFormat("dd MM yyyy", Locale.ENGLISH).parse(sDateFrom).time
            toDatePicker.show()}

        btnClearFilter.setOnClickListener{
            btnClearFilter.visibility = View.INVISIBLE
            txtDateFrom.text = ""
            txtDateTo.text = ""
            sDateFrom = ""
            sDateTo = ""
            showTasks(homeViewModel.recentlyUpdatedTasks.value, linearLayout)
        }

        return binding.root
    }

    private fun tryFilterByDates(linearLayout: LinearLayout) {
        val tasks = homeViewModel.recentlyUpdatedTasks.value ?: return
        showTasks(homeViewModel.filterByDates(tasks, sDateFrom, sDateTo), linearLayout)
    }

    private fun showTasks(it: List<Task>?, linearLayout: LinearLayout)
    {
        homeViewModel.showTasks(it,linearLayout,requireContext()) {
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
            binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
        }
    }

    override fun onResume() {
        super.onResume()
        val linearLayout = binding.innerLayout
        //display of tasks
        homeViewModel.recentlyUpdatedTasks.observe(viewLifecycleOwner) { tasks ->
            if (tasks != null)
                showTasks(tasks, linearLayout)
            else
            {
                linearLayout.removeAllViews()
                homeViewModel.showText("Loading...", linearLayout, requireContext())
            }
        }
    }


}
//old code to make my own "tabs" for completed and current tasks. May still come in useful, using inbuilt tabs now though
/*
val drawableCompletedFilter = androidx.core.graphics.drawable.DrawableCompat.wrap(btnFilterCompleted.background)
btnFilterCompleted.setOnClickListener {
           //filter by completed
           //set "completed" to red, current to blank
           isCompleted = true
           androidx.core.graphics.drawable.DrawableCompat.setTintList(drawableCompleted, ContextCompat.getColorStateList(requireContext(),R.color.PastelRed))
           androidx.core.graphics.drawable.DrawableCompat.setTintList(drawableCurrent, ContextCompat.getColorStateList(requireContext(),R.color.white))
           //linearLayout.visibility = 2;
           btnFilterCompleted.isEnabled = false
           btnFilterCurrent.isEnabled = true

           val tasks = homeViewModel.tasks.value
           if (tasks == null)
           {
               println("no tasks!")
               return@setOnClickListener
           }

           val filteredTasks = ArrayList<Task>()

           val completedStatusID = getCompletedStatusID()
           completedStatusID.observe(viewLifecycleOwner)
           {
               if (it != null) {
                   for(t: Task in tasks)
                   {
                       if (t.status_ID == it)
                           filteredTasks.add(t)
                   }
               }
               showTasks(filteredTasks,linearLayout)
           }
           showTasks(filteredTasks,linearLayout)

       }
       btnFilterCurrent.setOnClickListener {
           //filter by current
           //set "completed" to red, current to blank
           isCompleted = false
           androidx.core.graphics.drawable.DrawableCompat.setTintList(drawableCompleted, ContextCompat.getColorStateList(requireContext(),R.color.white))
           androidx.core.graphics.drawable.DrawableCompat.setTintList(drawableCurrent, ContextCompat.getColorStateList(requireContext(),R.color.PastelRed))

           btnFilterCompleted.isEnabled = true
           btnFilterCurrent.isEnabled = false

           val tasks = homeViewModel.tasks.value
           if (tasks == null)
           {
               println("no tasks!")
               return@setOnClickListener
           }
           val filteredTasks = ArrayList<Task>()
           val completedStatusID = getCompletedStatusID()
           completedStatusID.observe(viewLifecycleOwner)
           {
               if (it != null) {
                   for(t: Task in tasks)
                   {
                       if (t.status_ID != it)
                           filteredTasks.add(t)
                   }
               }
               showTasks(filteredTasks,linearLayout)
           }
           showTasks(filteredTasks,linearLayout)
       }*/