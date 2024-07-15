package com.example.lambdapp_androidapp_d2.ui.addtimelineupdate

import android.view.View
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Skill
import com.example.lambdapp_androidapp_d2.models.Task
import com.example.lambdapp_androidapp_d2.models.Task_Request
import com.example.lambdapp_androidapp_d2.ui.requests.EqpPlusQuantity
import com.example.lambdapp_androidapp_d2.ui.requests.StockPlusQuantity
import retrofit2.Call
import retrofit2.Response

class addTimelineUpdateViewModel : ViewModel() {
    public lateinit var skill: LiveData<List<Skill>>

    private var taskID : Int = -1
    lateinit var task: LiveData<Task>

    fun setTaskID(id: Int)
    {
        taskID = id
    }

    fun getTaskID(): Int {
        return taskID
    }


    fun createTask(taskID: Int): LiveData<com.example.lambdapp_androidapp_d2.models.Task>
    {
        val task = MutableLiveData<com.example.lambdapp_androidapp_d2.models.Task>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out
            conManager.getTask( taskID, object : retrofit2.Callback<com.example.lambdapp_androidapp_d2.models.Task> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<com.example.lambdapp_androidapp_d2.models.Task>,
                    response: Response<com.example.lambdapp_androidapp_d2.models.Task>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<com.example.lambdapp_androidapp_d2.models.Task>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }


    fun refreshTask() {
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
                    (task as MutableLiveData).postValue(response.body())
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Task>, t: Throwable) {
            }
        })

    }


}