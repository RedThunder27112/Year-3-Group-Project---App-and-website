package com.example.lambdapp_androidapp_d2.ui.registration

import android.util.Patterns
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.data.Result
import com.example.lambdapp_androidapp_d2.ui.login.LoggedInUserView

class RegistrationViewModel(private val loginRepository: LoginRepository) : ViewModel() {

    private val _registerForm = MutableLiveData<RegisterFormState>()
    val registerFormState: LiveData<RegisterFormState> = _registerForm

    private val _registerResult = MutableLiveData<RegisterResult>()
    val registerResult: LiveData<RegisterResult> = _registerResult

    var owner : LifecycleOwner? = null
    fun register(username: String, password: String, name: String, surname: String, code: String) {
        // can be launched in a separate asynchronous job
        loginRepository.owner = owner
        val result = loginRepository.register(username, password, name, surname, code)

        owner?.let {
            result.observe(it) { theResult ->
                when (theResult) {
                    is Result.Success -> {
                        if (theResult.data.userId==-1)
                            _registerResult.value =
                                RegisterResult(error = R.string.invalid_details)
                        else
                            _registerResult.value =
                                RegisterResult(success = LoggedInUserView(displayName = theResult.data.displayName))
                    }
                    else -> {_registerResult.value = RegisterResult(error = R.string.login_failed)
                    }
                }
            }
        }
    }

    fun registerDataChanged(username: String, password: String, name: String, surname: String) {
        if (!isUserNameValid(username)) {
            _registerForm.value = RegisterFormState(usernameError = R.string.invalid_username)
        } else if (!isPasswordValid(password)) {
            _registerForm.value = RegisterFormState(passwordError = R.string.invalid_password)
        } else if (!isNameValid(name)) {
            _registerForm.value = RegisterFormState(nameError = R.string.invalid_name)
        } else if (!isSurnameValid(surname)) {
            _registerForm.value = RegisterFormState(surnameError = R.string.invalid_surname)
        } else {
            _registerForm.value = RegisterFormState(isDataValid = true)
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

    private fun isNameValid(name: String): Boolean {
        return name.isNotBlank()
    }
    private fun isSurnameValid(surname: String): Boolean {
        return surname.isNotBlank()
    }
}