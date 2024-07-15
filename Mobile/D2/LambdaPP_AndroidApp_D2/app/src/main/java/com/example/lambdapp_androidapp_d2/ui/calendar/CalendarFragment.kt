package com.example.lambdapp_androidapp_d2.ui.calendar

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentCalendarBinding
import com.example.lambdapp_androidapp_d2.models.Task
import com.example.lambdapp_androidapp_d2.ui.home.HomeViewModel
import com.prolificinteractive.materialcalendarview.CalendarDay
import com.prolificinteractive.materialcalendarview.MaterialCalendarView
import retrofit2.Call
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList


class CalendarFragment : Fragment() {

    private var _binding: FragmentCalendarBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
            inflater: LayoutInflater,
            container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View {
        val slideshowViewModel =
            ViewModelProvider(this)[CalendarViewModel::class.java]

        _binding = FragmentCalendarBinding.inflate(inflater, container, false)
        val root: View = binding.root

        val textView: TextView = binding.textSlideshow
        slideshowViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }

        val calendarView = binding.calendarView
        val homeViewModel =
            ViewModelProvider(requireActivity())[HomeViewModel::class.java]

        val listOfTaskDateBounds = ArrayList<Pair<CalendarDay, CalendarDay>>()
        getEmployeeTasks().observe(viewLifecycleOwner) { tasks ->
            if (tasks != null)
                for(t in tasks)
                {
                    val startDate = databaseDateToCalendarDay(t.task_Date_Started)
                    val endDate = databaseDateToCalendarDay(t.task_Deadline)
                    if (startDate != null && endDate != null)
                        listOfTaskDateBounds.add(Pair(startDate,endDate))
                }

            calendarView.addDecorator(RangeDecorator(requireContext(),listOfTaskDateBounds))

         //   context?.resources?.let { calendarView.colo1(it.getColor(R.color.PastelRed,
             //   requireContext().resources.newTheme())) }

            calendarView.setOnDateChangedListener{ materialCalendarView: MaterialCalendarView, calendarDay: CalendarDay, b: Boolean ->
                showDateDialog(calendarDay, tasks, homeViewModel)
            }
        }

        return root
    }

    private fun showDateDialog(
        calendarDay: CalendarDay,
        tasks: List<Task>,
        homeViewModel: HomeViewModel
    ) {
        //create dialog and get components
        val dialog = Dialog(requireContext())
        dialog.setContentView(R.layout.specific_day_dialog)
        dialog.show()
        val txtDate = dialog.findViewById<TextView>(R.id.txtDate)
        val linearLayout = dialog.findViewById<LinearLayout>(R.id.dayDialogInnerLayout)


        //display tasks on this date
        //first filter tasks - which tasks are busy on this day?
        val filteredTasks = ArrayList<Task>()
        for(t in tasks)
        {
            val startDate = databaseDateToCalendarDay(t.task_Date_Started)
            val endDate = databaseDateToCalendarDay(t.task_Deadline)
            if (startDate != null && endDate != null)
                if (calendarDay.isInRange(startDate, endDate))
                    filteredTasks.add(t)
        }

        homeViewModel.showTasks(filteredTasks,linearLayout,requireContext()) {
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask",it)
            binding.root.findNavController().navigate(R.id.action_nav_calendar_to_nav_taskDetailsParent)
            dialog.dismiss()
        }


        dialog.findViewById<ImageButton>(R.id.imgBtnClose).setOnClickListener{dialog.dismiss()}


        //set date heading
        val inputFormat = SimpleDateFormat("d M yyyy", Locale.ENGLISH)
        val outputFormat = SimpleDateFormat("d MMMM yyyy", Locale.ENGLISH)
        val date: String? =
            inputFormat.parse("${calendarDay.day} ${calendarDay.month} ${calendarDay.year}")
                ?.let { outputFormat.format(it) }
        txtDate.text = date
    }

    private fun databaseDateToCalendarDay(date: String) : CalendarDay?
    {
        val basicDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH).parse(date)
            ?: return null
        val calendarDate = Calendar.getInstance()
        calendarDate.timeInMillis = basicDate.time

        val year = calendarDate[Calendar.YEAR]
        val month = calendarDate[Calendar.MONTH]+1
        val day = calendarDate[Calendar.DAY_OF_MONTH]

        return CalendarDay.from(year,month,day)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun getEmployeeTasks() : MutableLiveData<List<Task>>
    {
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        val conManager = ApiConnectionManager()
        return  MutableLiveData<List<Task>>().apply {
            value = null

            conManager.getAllEmployeeTasks( userID, object : retrofit2.Callback<MutableList<Task>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Task>>,
                    response: Response<MutableList<Task>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Task>>, t: Throwable) {
                    value = null
                }
            })
        }

    }
}