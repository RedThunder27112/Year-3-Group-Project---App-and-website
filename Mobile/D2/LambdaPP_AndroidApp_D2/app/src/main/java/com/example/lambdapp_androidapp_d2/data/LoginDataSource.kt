package com.example.lambdapp_androidapp_d2.data

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.data.model.LoggedInUser
import com.example.lambdapp_androidapp_d2.models.Employee
import retrofit2.Call
import retrofit2.Response
import java.io.IOException

/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
class LoginDataSource {
    fun login(username: String, password: String): LiveData<Result<LoggedInUser>> {
        val result = MutableLiveData<Result<LoggedInUser>>()
        try {
            // TODO: handle loggedInUser authentication
            val ConManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            ConManager.login(username, password, object : retrofit2.Callback<Employee> {
                override fun onResponse(call: Call<Employee>, response: Response<Employee>) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        if (response.body()!=null)
                            result.postValue(Result.Success(LoggedInUser(response.body()!!.emp_ID,username,response.body()!!.emp_IsAdmin)))
                        else
                            result.postValue(Result.Error(IOException("Error logging in: invalid user")))
                    }
                    else
                        result.postValue(Result.Error(IOException("Error logging in: ${response.code()}")))
                }

                override fun onFailure(call: Call<Employee>, t: Throwable) {
                    result.postValue(Result.Error(IOException(t.stackTraceToString())))
                }


            })

            //val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
            //result.postValue(Result.Success(fakeUser))
            return result
        } catch (e: Throwable) {
            result.postValue(Result.Error(IOException("Error logging in", e)))
            return result
        }
    }

    fun register(username: String, password: String, name: String, surname: String, code: String): LiveData<Result<LoggedInUser>> {
        val result = MutableLiveData<Result<LoggedInUser>>()
        try {
            // TODO: handle loggedInUser authentication
            val ConManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            ConManager.register(username, password, name, surname, code, object : retrofit2.Callback<Employee> {
                override fun onResponse(call: Call<Employee>, response: Response<Employee>) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        if (response.body()!=null)
                            result.postValue(Result.Success(LoggedInUser(response.body()!!.emp_ID,username,response.body()!!.emp_IsAdmin)))
                        else
                            result.postValue(Result.Error(IOException("Error registering: invalid user")))
                    }
                    else
                        result.postValue(Result.Error(IOException("Error registering: ${response.code()}")))
                }

                override fun onFailure(call: Call<Employee>, t: Throwable) {
                    result.postValue(Result.Error(IOException(t.stackTraceToString())))
                }

            })

            //val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
            //result.postValue(Result.Success(fakeUser))
            return result
        } catch (e: Throwable) {
            result.postValue(Result.Error(IOException("Error registering", e)))
            return result
        }
    }


    fun logout() {
        // TODO: revoke authentication
    }
}