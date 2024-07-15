package com.example.lambdapp_androidapp_d2.ui.Notifications

import android.content.Context
import android.util.Log
import android.widget.LinearLayout
import android.widget.TextView
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.MainActivity
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Notification
import com.example.lambdapp_androidapp_d2.models.Task
import retrofit2.Call
import retrofit2.Response

class notificationViewModel : ViewModel() {

    private var taskID : Int = -1

    lateinit var notification : LiveData<List<Notification>>

    fun getTaskID(): Int {
        return taskID
    }

    fun setTaskID(taskID2 : Int) {
         taskID = taskID2
    }

    fun getNotifications(empID: Int): LiveData<List<Notification>>
    {
        notification = MutableLiveData<List<Notification>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getNotifications( empID, object : retrofit2.Callback<MutableList<Notification>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Notification>>,
                    response: Response<MutableList<Notification>>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        value = response.body()
                        Log.i("tagProp","1")
                    } else
                    {
                        Log.i("tagProp","2")
                        value = null
                    }

                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Notification>>, t: Throwable) {
                    value = null
                }
            })
        }
        return notification
    }



}