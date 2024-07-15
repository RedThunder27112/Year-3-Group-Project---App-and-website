package com.example.lambdapp_androidapp_d2.ui.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import android.util.Patterns
import androidx.lifecycle.LifecycleOwner
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.data.Result

import com.example.lambdapp_androidapp_d2.R

class LoginViewModel(private val loginRepository: LoginRepository) : ViewModel() {

    private val _loginForm = MutableLiveData<LoginFormState>()
    val loginFormState: LiveData<LoginFormState> = _loginForm

    private val _loginResult = MutableLiveData<LoginResult>()
    val loginResult: LiveData<LoginResult> = _loginResult

    var owner : LifecycleOwner? = null
    fun login(username: String, password: String) {
        // can be launched in a separate asynchronous job
        loginRepository.owner = owner
        val result = loginRepository.login(username, password)

        owner?.let {
            result.observe(it) { theResult ->
                when (theResult) {
                    is Result.Success -> {
                        if (theResult.data.userId==-1)
                            _loginResult.value =
                                LoginResult(error = R.string.invalid_details)
                        else
                            _loginResult.value =
                                LoginResult(success = LoggedInUserView(displayName = theResult.data.displayName))
                    }
                    else -> {_loginResult.value = LoginResult(error = R.string.login_failed)
                    println(theResult.toString())}
                }
            }
        }
    }

    fun loginDataChanged(username: String, password: String) {
        if (!isUserNameValid(username)) {
            _loginForm.value = LoginFormState(usernameError = R.string.invalid_username)
        } else if (!isPasswordValid(password)) {
            _loginForm.value = LoginFormState(passwordError = R.string.invalid_password)
        } else {
            _loginForm.value = LoginFormState(isDataValid = true)
        }
    }

    // A placeholder username validation check
    private fun isUserNameValid(username: String): Boolean {
        return if (username.contains("@")) {
            Patterns.EMAIL_ADDRESS.matcher(username).matches()
        } else {
            username.isNotBlank()
        }
    }

    // A placeholder password validation check
    private fun isPasswordValid(password: String): Boolean {
        return password.length > 5
    }
}