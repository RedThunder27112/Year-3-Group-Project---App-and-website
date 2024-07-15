package com.example.lambdapp_androidapp_d2.data.model

/**
 * Data class that captures user information for logged in users retrieved from LoginRepository
 */
data class LoggedInUser(
    val userId: Int,
    val displayName: String,
    val isAdmin: Boolean
)