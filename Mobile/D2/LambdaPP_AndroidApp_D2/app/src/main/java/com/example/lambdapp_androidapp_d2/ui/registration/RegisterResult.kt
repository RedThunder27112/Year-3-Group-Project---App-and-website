package com.example.lambdapp_androidapp_d2.ui.registration

import com.example.lambdapp_androidapp_d2.ui.login.LoggedInUserView

class RegisterResult (
    val success: LoggedInUserView? = null,
    val error: Int? = null
)