package com.example.lambdapp_androidapp_d2.ui.completedtasks

import android.annotation.SuppressLint
import android.app.DatePickerDialog
import android.content.Context
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.text.HtmlCompat
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentCompletedTasksBinding
import com.example.lambdapp_androidapp_d2.models.Task
import retrofit2.Call
import retrofit2.Response
import java.util.*


class CompletedTasksFragment : Fragment() {
    private var _binding: FragmentCompletedTasksBinding? = null


    private var sDateFrom: String = ""
    private var sDateTo: String = ""

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        _binding = FragmentCompletedTasksBinding.inflate(inflater, container, false)

        val linearLayout = binding.innerLayout
        val btnClearFilter = binding.btnFilterDates
        val txtDateFrom = binding.txtDateFrom
        val txtDateTo = binding.txtDateTo

        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out


        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        conManager.getEmployeeCompletedTasks( userID, object : retrofit2.Callback<MutableList<Task>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<MutableList<Task>>,
                response: Response<MutableList<Task>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    val completedTasks = response.body()
                    showTasks(completedTasks, linearLayout)

                    if (completedTasks != null)
                    {
                        //handling date filtering

                        txtDateFrom.setOnClickListener{
                            //save the date and filter
                            val fromDatePicker = initDatePicker(txtDateFrom,requireContext())
                            { year: Int, month: Int, day: Int ->
                                sDateFrom = "$day $month $year"
                                showTasks(filterByDates(completedTasks, sDateFrom, sDateTo), linearLayout)
                                btnClearFilter.visibility = View.VISIBLE
                            }
                            //if the "to" date has already been set, make that the max selectable date
                            if (sDateTo.isNotEmpty())
                                fromDatePicker.datePicker.maxDate = SimpleDateFormat("dd MM yyyy", Locale.ENGLISH).parse(sDateTo).time
                            fromDatePicker.show()}


                        txtDateTo.setOnClickListener{
                            val toDatePicker = initDatePicker(txtDateTo,requireContext())
                            { year: Int, month: Int, day: Int ->
                                sDateTo = "$day $month $year"
                                showTasks(filterByDates(completedTasks, sDateFrom, sDateTo), linearLayout)
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
                            showTasks(completedTasks, linearLayout)
                        }
                    }


                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Task>>, t: Throwable) {
            }
        })

        //handling date filtering
        btnClearFilter.visibility = View.INVISIBLE

        return binding.root
    }



    fun showTasks(it: List<Task>?, linearLayout: LinearLayout)
    {
        if (it != null)
        {
            linearLayout.removeAllViews()
            if (it.isEmpty())
                showText("No tasks to show here yet!",linearLayout)
            else {
                for (t: Task in it)
                    addButton(t, linearLayout)
            }
        }
    }
    fun showText(text: String, linearLayout: LinearLayout)
    {
        val txtView = TextView(requireContext())
        txtView.text = text
        linearLayout.addView(txtView)
    }
    @SuppressLint("SimpleDateFormat")
    fun addButton(t: Task, linearLayout: LinearLayout) {
        val b = Button(context)
        if (t.task_Deadline == null)
            b.text = t.task_Name
        else
        {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            val outputFormat = SimpleDateFormat("d MMMM", Locale.ENGLISH)
            val date = inputFormat.parse(t.task_Deadline)
            "<b>${t.status.status_Name}:</b><br> ${t.task_Name}<br>Due: ${outputFormat.format(date)}".also { b.text = HtmlCompat.fromHtml(it,
                HtmlCompat.FROM_HTML_MODE_COMPACT)}
        }

        linearLayout.addView(b)
        b.setOnClickListener{
            val result = Bundle()
            result.putInt("taskID",t.task_ID)
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask",result)
            binding.root.findNavController().navigate(R.id.action_nav_completed_tasks_to_nav_taskDetailsParent)
        }
    }

    @SuppressLint("SimpleDateFormat")
    fun filterByDates(tasks: List<Task>, dateFrom: String, dateTo: String) : List<Task>
    {
        val inputFormatForFromAndToDates = SimpleDateFormat("dd MM yyyy")
        val filteredTasks = ArrayList<Task>()
        //check which textboxes are empty

        if (dateFrom.isBlank())
        {
            if (dateTo.isBlank())
            {
                //both blank, do nothing
            }
            else
            {
                //has only a "to" date, filter by before
                val toDate = inputFormatForFromAndToDates.parse(dateTo)
                for(t: Task in tasks)
                {
                    val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                    val date = inputFormat.parse(t.task_Deadline)
                    if (date.before(toDate))
                        filteredTasks.add(t)
                }
                return filteredTasks
            }
        }
        else
        {
            if (dateTo.isBlank())
            {
                //has only a "from" date, filter by after
                val fromDate = inputFormatForFromAndToDates.parse(dateFrom)

                for(t: Task in tasks)
                {
                    val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                    val date = inputFormat.parse(t.task_Deadline)
                    if (date.after(fromDate))
                        filteredTasks.add(t)
                }
                return filteredTasks
            }
            else
            {
                //has both "to" and "from" date, filter by both
                val toDate = inputFormatForFromAndToDates.parse(dateTo)
                val fromDate = inputFormatForFromAndToDates.parse(dateFrom)

                for(t: Task in tasks)
                {
                    val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                    val date = inputFormat.parse(t.task_Deadline)
                    if (date.before(toDate) && date.after(fromDate))
                        filteredTasks.add(t)
                }
                return filteredTasks
            }
        }
        return filteredTasks

    }

    fun initDatePicker(dateButton: Button, context: Context, saveAndFilterDates: (year : Int, month : Int, day : Int) -> Unit) : DatePickerDialog {
        val dateSetListener =
            DatePickerDialog.OnDateSetListener { datePicker, year, month, day ->
                //when date is set, show date in button
                val inputFormat = SimpleDateFormat("d M yyyy", Locale.ENGLISH)

                val outputFormat =
                    if (getYear() != year)
                        SimpleDateFormat("d MM yyyy", Locale.ENGLISH)
                    else SimpleDateFormat("d MMM", Locale.ENGLISH)

                //month+1 because months are weird, don't worry about it
                val date: String = outputFormat.format(inputFormat.parse("$day ${month + 1} $year"))
                dateButton.text = date
                //then save and filter dates
                saveAndFilterDates(year, month + 1, day)
            }
        val cal = Calendar.getInstance()
        val year = cal[Calendar.YEAR]
        val month = cal[Calendar.MONTH]
        val day = cal[Calendar.DAY_OF_MONTH]
        //val style: Int = AlertDialog.THEME_HOLO_LIGHT
        return DatePickerDialog(context, dateSetListener, year, month, day)
        //datePickerDialog.getDatePicker().setMaxDate(System.currentTimeMillis());
    }

    private fun getYear(): Any {
        val cal = Calendar.getInstance()
        cal.time = GregorianCalendar.getInstance().time
        return cal.get(Calendar.YEAR)
    }

}