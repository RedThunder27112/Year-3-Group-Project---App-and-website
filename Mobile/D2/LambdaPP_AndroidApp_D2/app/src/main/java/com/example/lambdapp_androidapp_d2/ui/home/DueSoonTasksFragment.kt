package com.example.lambdapp_androidapp_d2.ui.home

import android.annotation.SuppressLint
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
import com.example.lambdapp_androidapp_d2.databinding.FragmentDueSoonTasksBinding
import com.example.lambdapp_androidapp_d2.models.Task
import java.util.*

class DueSoonTasksFragment : Fragment() {

    private var _binding: FragmentDueSoonTasksBinding? = null
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
        // Inflate the layout for this fragment
        _binding = FragmentDueSoonTasksBinding.inflate(inflater, container, false)

        homeViewModel =
            ViewModelProvider(requireActivity())[HomeViewModel::class.java]
        val linearLayout = binding.innerLayout
        val btnClearFilter = binding.btnFilterDates
        val txtDateFrom = binding.txtDateFrom
        val txtDateTo = binding.txtDateTo

        //default display of tasks: Displays not-completed tasks
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

    @SuppressLint("SimpleDateFormat")
    private fun showTasks(tasks: List<Task>?, linearLayout: LinearLayout)
    {
        linearLayout.removeAllViews()
        if (tasks.isNullOrEmpty())
        {
            //still show the null tasks - this function handles no tasks by showing a "no tasks" message
            homeViewModel.showTasks(tasks,linearLayout,requireContext()) {
                requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
                binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
            }
        }
        else
        {
            var sortedTasks = sortTasks(tasks)

            //group tasks by date ranges
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            val dayFormat = SimpleDateFormat("yyyy-MM-dd")
            val weekFormat = SimpleDateFormat("w")
            val monthFormat = SimpleDateFormat("MM")

            val todaysDate = GregorianCalendar.getInstance().time
            val overdueTasks = sortedTasks.filter { task ->
                inputFormat.parse(task.task_Deadline).before(todaysDate)}
            sortedTasks = sortedTasks.drop(overdueTasks.size)
            val todaysTasks = sortedTasks.filter { task ->
                dayFormat.format(inputFormat.parse(task.task_Deadline))== dayFormat.format(todaysDate)}
            sortedTasks = sortedTasks.drop(todaysTasks.size)
            val thisWeeksTasks = sortedTasks.filter { task ->
                weekFormat.format(inputFormat.parse(task.task_Deadline))== weekFormat.format(todaysDate)}
            sortedTasks = sortedTasks.drop(thisWeeksTasks.size)
            val thisMonthsTasks = sortedTasks.filter { task ->
                monthFormat.format(inputFormat.parse(task.task_Deadline))== monthFormat.format(todaysDate)}
            sortedTasks = sortedTasks.drop(thisMonthsTasks.size)
            val nextMonthsTasks = sortedTasks.filter { task ->
                monthFormat.format(inputFormat.parse(task.task_Deadline)).toInt()== monthFormat.format(todaysDate).toInt()+1}

            sortedTasks = sortedTasks.drop(nextMonthsTasks.size)

            displayTasksInDateCategory(overdueTasks, linearLayout, "Overdue")
            displayTasksInDateCategory(todaysTasks, linearLayout, "Due Today")
            displayTasksInDateCategory(thisWeeksTasks, linearLayout, "Due This Week")
            displayTasksInDateCategory(thisMonthsTasks, linearLayout, "Due This Month")
            displayTasksInDateCategory(thisMonthsTasks, linearLayout, "Due Next Month")
            displayTasksInDateCategory(sortedTasks, linearLayout, "A long way away")



        }
    }

    private fun displayTasksInDateCategory(tasks: List<Task>, linearLayout: LinearLayout, s: String) {
        if (tasks.isEmpty())
            return
        val subLayout = LinearLayout(requireContext())
        subLayout.orientation = LinearLayout.VERTICAL
        linearLayout.addView(subLayout)
        homeViewModel.showTasks(tasks,subLayout,requireContext()) {
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
            binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
        }
        val txtView = TextView(context)
        txtView.text = HtmlCompat.fromHtml(
            "<b>$s:</b>",
            HtmlCompat.FROM_HTML_MODE_COMPACT)

        subLayout.addView(txtView, 0)
    }

    @SuppressLint("SimpleDateFormat")
    private fun sortTasks(unsortedTasks: List<Task>): List<Task>
    {
        if (unsortedTasks.isNotEmpty())
        {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            return unsortedTasks.sortedBy { task: Task -> inputFormat.parse(task.task_Deadline)}
        }
        return unsortedTasks

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