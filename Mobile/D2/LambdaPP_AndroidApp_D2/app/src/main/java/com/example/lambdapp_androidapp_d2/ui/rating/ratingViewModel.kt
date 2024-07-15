package com.example.lambdapp_androidapp_d2.ui.rating

import android.content.Context
import android.widget.LinearLayout
import android.widget.TextView
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.MainActivity
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Task
import retrofit2.Call
import retrofit2.Response

class ratingViewModel : ViewModel() {

    private var taskID : Int = -1
    var task : LiveData<Task> = MutableLiveData()

    fun setTask(id: Int)
    {
        taskID = id
    }
    fun getTaskID(): Int {
        return taskID
    }

    private fun createTask(taskID: Int, activity: MainActivity): LiveData<Task>
    {
        val task = MutableLiveData<Task>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out
            conManager.getTask( taskID, object : retrofit2.Callback<Task> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Task>,
                    response: Response<Task>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        value = response.body()
                        //rename the title of the activity to the task name
                        value?.let { activity.renameTitle(it.task_Name) }
                    } else
                        value = null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Task>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }

    fun showText(text: String, linearLayout: LinearLayout, context: Context)
    {
        val txtView = TextView(context)
        txtView.text = text
        linearLayout.addView(txtView)
    }
}