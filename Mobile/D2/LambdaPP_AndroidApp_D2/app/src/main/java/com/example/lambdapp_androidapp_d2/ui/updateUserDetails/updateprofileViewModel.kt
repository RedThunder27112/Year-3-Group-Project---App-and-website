package com.example.lambdapp_androidapp_d2.ui.updateUserDetails

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Skill
import com.example.lambdapp_androidapp_d2.models.Task_Update
import retrofit2.Call
import retrofit2.Response

class updateprofileViewModel : ViewModel() {
    public lateinit var skill: LiveData<List<Skill>>

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

    public fun setEmployeeSkills()
    {

         skill = MutableLiveData<List<Skill>>().apply {
            value = null
            val id = LoginRepository.getInstance()?.user?.userId ?: -1
            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getEmployeeSkills(id, object : retrofit2.Callback<MutableList<Skill>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Skill>>,
                    response: Response<MutableList<Skill>>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        response.body()
                        Log.i("errrr","1")
                    } else
                    {
                        null
                        Log.i("errrr","2")
                    }

                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Skill>>, t: Throwable) {
                    value = null
                    Log.i("errrr","3")
                }
            })
        }
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
        refreshTask2()
    }

    fun refreshTask2() {
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out
        conManager.getEmployeeSkills(userID, object : retrofit2.Callback<List<Skill>>  {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<List<Skill>>,
                response: Response<List<Skill>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    (skill as MutableLiveData).postValue(response.body())
                    Log.i("errr","eish")
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<List<Skill>>, t: Throwable) {
            }
        })
    }



    fun getEmployeeSkills(): LiveData<List<Skill>>
    {
        return skill
    }



    fun getUpdate(): MutableLiveData<Employee>
    {
        return _emp
    }




    val employee: LiveData<Employee> = _emp
}