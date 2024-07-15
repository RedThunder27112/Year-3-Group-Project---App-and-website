package com.example.lambdapp_androidapp_d2

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationCheckReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        // This method is called when the BroadcastReceiver is receiving an Intent broadcast.
        // In our case, when the alarm has said that it's time to check for new notifications
        //we want to start the background service
        Log.d("onReceive: ", "Notification check - intent received!")
        val serviceIntent = Intent(context, BackgroundService::class.java)
        context.startService(serviceIntent)

    }
}