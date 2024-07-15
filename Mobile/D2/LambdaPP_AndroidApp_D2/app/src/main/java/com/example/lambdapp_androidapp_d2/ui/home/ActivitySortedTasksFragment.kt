package com.example.lambdapp_androidapp_d2.ui.home

import android.icu.text.SimpleDateFormat
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.text.HtmlCompat
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentActivitySortedTasksBinding
import com.example.lambdapp_androidapp_d2.models.Task
import java.util.*
import kotlin.collections.ArrayList

class ActivitySortedTasksFragment : Fragment() {

    private var _binding: FragmentActivitySortedTasksBinding? = null
    private lateinit var homeViewModel: HomeViewModel

    private var sDateFrom: String = ""
    private var sDateTo: String = ""

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        homeViewModel =
            ViewModelProvider(requireActivity())[HomeViewModel::class.java]
        // Inflate the layout for this fragment
        _binding = FragmentActivitySortedTasksBinding.inflate(inflater, container, false)
        val linearLayout = binding.innerLayout
        val btnClearFilter = binding.btnFilterDates
        val txtDateFrom = binding.txtDateFrom
        val txtDateTo = binding.txtDateTo

        //display of tasks
        homeViewModel.currentTasks.observe(viewLifecycleOwner) { tasks ->
            if (tasks != null)
                showTasks(tasks, linearLayout)
            else
                homeViewModel.showText("Loading...", linearLayout, requireContext())
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

    private fun showTasks(tasks: List<Task>?, linearLayout: LinearLayout)
    {
        linearLayout.removeAllViews()
        if (tasks == null)
        {
            //still show the null tasks - this function handles no tasks by showing a "no tasks" message
            homeViewModel.showTasks(null,linearLayout,requireContext()) {
                requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
                binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
            }
        }
        else
        {
            if (tasks.isEmpty())
            {
                //still show the null tasks - this function handles no tasks by showing a "no tasks" message
                homeViewModel.showTasks(tasks,linearLayout,requireContext()) {
                    requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
                    binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
                }
            }
            else
            {
                //group tasks by activity ID
                val actIds = getActivityIds(tasks)
                for(i: Int in actIds)
                {
                    val tasksWithID = tasks.filter { task -> task.act_ID == i }

                    val subLayout = LinearLayout(requireContext())
                    subLayout.orientation = LinearLayout.VERTICAL
                    linearLayout.addView(subLayout)
                    homeViewModel.showTasks(tasksWithID,subLayout,requireContext()) {
                        requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
                        binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
                    }
                    val txtView = TextView(context)
                    txtView.text = HtmlCompat.fromHtml("<b>" + tasksWithID.first().activity.act_Name + ":</b>",HtmlCompat.FROM_HTML_MODE_COMPACT)

                    subLayout.addView(txtView, 0)
                }
            }


        }

    }


    private fun getActivityIds(tasks: List<Task>): List<Int>
    {
        //gets the distinct activity Id's
        val sortedTasks = tasks.sortedBy { task: Task -> task.act_ID }
        val ActIDs = ArrayList<Int>()
        var CurrentActID = -1
        for(t: Task in sortedTasks)
        {
            if (t.act_ID != CurrentActID)
            {
                CurrentActID = t.act_ID
                ActIDs.add(t.act_ID)
            }
        }
        return ActIDs
    }


    override fun onResume() {
        super.onResume()
        val linearLayout = binding.innerLayout
        //display of tasks
        homeViewModel.currentTasks.observe(viewLifecycleOwner) { tasks ->
            if (tasks != null)
                showTasks(tasks, linearLayout)
            else
                homeViewModel.showText("Loading...", linearLayout, requireContext())
        }

    }

}