package com.example.lambdapp_androidapp_d2.ui.userinfo

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Task
import retrofit2.Call
import retrofit2.Response

class userinfoViewModel : ViewModel() {

    private var _emp = MutableLiveData<Employee>().apply {
        value = null

        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out

        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        conManager.getEmployee(userID, object : retrofit2.Callback<Employee> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Employee>,
                response: Response<Employee>
            ) {
                //check if the response was successful
                value = if (response.isSuccessful) {
                    response.body()
                } else
                    null
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Employee>, t: Throwable) {
                value = null
            }
        })
    }

    fun updateDetails(employee: MutableLiveData<Employee>)
    {
        _emp = employee
    }

    fun refreshTask() {
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out
        conManager.getEmployee(userID, object : retrofit2.Callback<Employee>  {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Employee>,
                response: Response<Employee>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    (employee as MutableLiveData).postValue(response.body())
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Employee>, t: Throwable) {
            }
        })

    }



    var employee: LiveData<Employee> = _emp
}