package com.example.lambdapp_androidapp_d2.data

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LiveData
import com.example.lambdapp_androidapp_d2.data.model.LoggedInUser

/**
 * Class that requests authentication and user information from the remote data source and
 * maintains an in-memory cache of login status and user credentials information.
 */

class LoginRepository(val dataSource: LoginDataSource) {

    var owner: LifecycleOwner? = null

    // in-memory cache of the loggedInUser object
    var user: LoggedInUser? = null
        private set

    val isLoggedIn: Boolean
        get() = user != null

    init {
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
        user = null
        instance = this
    }

    fun logout() {
        user = null
        dataSource.logout()
    }

    companion object
    {
        private var instance: LoginRepository? = null
        fun getInstance(): LoginRepository? {
            if (instance == null) {
                return null
            }
            return instance
        }
    }


    fun login(username: String, password: String): LiveData<Result<LoggedInUser>> {
        // handle login
        val result = dataSource.login(username, password)



        owner?.let {
            result.observe(it) { theResult ->
                when (theResult) {
                    is Result.Success -> {
                        setLoggedInUser(theResult.data)
                    }
                    else -> {}
                }
            }
        }
        return result
    }

    fun register(username: String, password: String, name: String, surname: String, code: String): LiveData<Result<LoggedInUser>> {
        // handle register
        val result = dataSource.register(username, password,name, surname, code)



        owner?.let {
            result.observe(it) { theResult ->
                when (theResult) {
                    is Result.Success -> {
                        setLoggedInUser(theResult.data)
                    }
                    else -> {}
                }
            }
        }
        return result
    }

    private fun setLoggedInUser(loggedInUser: LoggedInUser) {
        this.user = loggedInUser
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
    }
}