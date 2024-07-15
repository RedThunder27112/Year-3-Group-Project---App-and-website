package com.example.lambdapp_androidapp_d2.ui.home

import android.annotation.SuppressLint
import android.app.DatePickerDialog
import android.app.DatePickerDialog.OnDateSetListener
import android.content.Context
import android.icu.text.SimpleDateFormat
import android.os.Build
import android.os.Bundle
import android.view.View.OnClickListener
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.core.text.HtmlCompat
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Task
import com.example.lambdapp_androidapp_d2.models.Task_Status
import retrofit2.Call
import retrofit2.Response
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*


class HomeViewModel : ViewModel(){

    private val COMPLETED_FROM_DB = "COMPLETED"


    //core task retrieval functions
    private val _currentTasks = MutableLiveData<List<Task>>().apply {
        value = null
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out


        conManager.getEmployeeTasks( userID, object : retrofit2.Callback<MutableList<Task>> {
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

        //alternate solution: requires "this" to be a lifecycle owner, so should work in Fragments, or with AppCompatActivities

        /*ConManager.weatherForecasts.observe(this) { response ->
            var str = ""
            for (f: WeatherForecast in response)
                str += f.temperatureC.toString() + "C   " + f.summary + "\n"
            value = str
        }*/

    }
    val currentTasks: LiveData<List<Task>> = _currentTasks

    private val _recentlyUpdatedTasks = MutableLiveData<List<Task>>().apply {
        value = null

        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1

        conManager.getEmployeeRecentlyUpdatedTasks( userID, object : retrofit2.Callback<MutableList<Task>> {
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

        //alternate solution: requires "this" to be a lifecycle owner, so should work in Fragments, or with AppCompatActivities

        /*ConManager.weatherForecasts.observe(this) { response ->
            var str = ""
            for (f: WeatherForecast in response)
                str += f.temperatureC.toString() + "C   " + f.summary + "\n"
            value = str
        }*/

    }
    val recentlyUpdatedTasks: LiveData<List<Task>> = _recentlyUpdatedTasks


    //utility functions for home pages
    @SuppressLint("SimpleDateFormat")
    fun addButton(t: Task, linearLayout: LinearLayout, context: Context, listener: OnClickListener) {
        val b = Button(context)
        if (t.task_Deadline == null)
            b.text = t.task_Name
        else
        {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            val outputFormat = SimpleDateFormat("d MMMM", Locale.ENGLISH)
            val date = inputFormat.parse(t.task_Deadline)
            "<b>${t.status.status_Name}:</b><br> ${t.task_Name}<br>Due: ${outputFormat.format(date)}".also { b.text = HtmlCompat.fromHtml(it,HtmlCompat.FROM_HTML_MODE_COMPACT)}



            if (date.before(GregorianCalendar.getInstance().time))
            {
                b.setTextColor(context.resources.getColor(R.color.PastelRed,context.resources.newTheme()))
            }



        }


        b.background.setTint(context.resources.getColor(R.color.PaleBlue,context.resources.newTheme()))
        //b.setTextColor(context.resources.getColor(R.color.white,context.resources.newTheme()))
        linearLayout.addView(b)
        b.setOnClickListener(listener)
    }

    fun getCompletedStatusID(): LiveData<Int>
    {
        val conManager = ApiConnectionManager()
        //get statuses
        val toReturn = MutableLiveData<Int>().apply{
            value = null
            conManager.getStatuses(object : retrofit2.Callback<List<Task_Status>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<List<Task_Status>>,
                    response: Response<List<Task_Status>>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        for (s: Task_Status in response.body()!!)
                        {
                            //find the "completed" status
                            if (s.status_Name == COMPLETED_FROM_DB) {
                                value = s.status_ID
                                return
                            }
                        }
                        value = -1
                    } else {
                        value = -1
                    }
                }

                //failure - an exception t was encountered
                override fun onFailure(call: Call<List<Task_Status>>, t: Throwable) {
                    value = -2
                }
            })
        }

        return toReturn
    }

    fun showText(text: String, linearLayout: LinearLayout, context: Context)
    {
        val txtView = TextView(context)
        txtView.text = text
        linearLayout.addView(txtView)
    }

    //shows the tasks on the linear layout.
    //navigation instruction should be a function that navigates to destination, should look something like:
    //            parentFragmentManager.setFragmentResult("selectedTask",it)
    //            binding.root.findNavController().navigate(R.id.action_nav_home_to_nav_taskDetailsParent)
    fun showTasks(it: List<Task>?, linearLayout: LinearLayout, context: Context, navigationInstruction: (input: Bundle) -> Unit)
    {
        if (it != null)
        {
            linearLayout.removeAllViews()
            if (it.isEmpty())
                showText("No tasks to show here yet!",linearLayout, context)
            else {
                linearLayout.removeAllViews()
                for (t: Task in it)
                    addButton(t, linearLayout,context){
                        val result = Bundle()
                        result.putInt("taskID",t.task_ID)
                        navigationInstruction(result)
                    }
            }
        }
        else
            showText("No tasks to show here yet!",linearLayout, context)
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

    fun initDatePicker(dateButton: Button, context: Context, saveAndFilterDates: (year : Int, month : Int, day : Int) -> Unit) : DatePickerDialog{
        val dateSetListener =
            OnDateSetListener { datePicker, year, month, day ->
                //when date is set, show date in button
                val inputFormat = SimpleDateFormat("d M yyyy", Locale.ENGLISH)

                val outputFormat =
                    if (getYear() != year)
                         SimpleDateFormat("d MM yyyy", Locale.ENGLISH)
                    else SimpleDateFormat("d MMM", Locale.ENGLISH)

                //month+1 because months are weird, don't worry about it
                val date: String = outputFormat.format(inputFormat.parse("$day ${month+1} $year"))
                dateButton.text = date
                //then save and filter dates
                saveAndFilterDates(year,month+1,day)
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

    fun refreshTasks() {
        //create the connection manager
        val conManager = ApiConnectionManager()
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        conManager.getEmployeeTasks(userID, object : retrofit2.Callback<MutableList<Task>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<MutableList<Task>>,
                response: Response<MutableList<Task>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    (currentTasks as MutableLiveData).postValue(response.body())
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Task>>, t: Throwable) {
            }
        })
        conManager.getEmployeeRecentlyUpdatedTasks(userID, object : retrofit2.Callback<MutableList<Task>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<MutableList<Task>>,
                response: Response<MutableList<Task>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    (recentlyUpdatedTasks as MutableLiveData).postValue(response.body())
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Task>>, t: Throwable) {
            }
        })

    }

}