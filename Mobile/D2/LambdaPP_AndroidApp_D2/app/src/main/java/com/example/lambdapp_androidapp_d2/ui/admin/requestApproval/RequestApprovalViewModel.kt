package com.example.lambdapp_androidapp_d2.ui.admin.requestApproval

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.models.Task_Request
import retrofit2.Call
import retrofit2.Response

class RequestApprovalViewModel : ViewModel() {

    private val _currentRequests = MutableLiveData<List<Task_Request>>().apply {
        value = null

        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out


        conManager.getRequestsToResolve( object : retrofit2.Callback<MutableList<Task_Request>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<MutableList<Task_Request>>,
                response: Response<MutableList<Task_Request>>
            ) {
                //check if the response was successful
                value = if (response.isSuccessful) {
                    response.body()
                } else
                    null
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Task_Request>>, t: Throwable) {
                value = null
            }
        })
    }
    val currentRequests: LiveData<List<Task_Request>> = _currentRequests
}