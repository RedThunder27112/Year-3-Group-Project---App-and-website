package com.example.lambdapp_androidapp_d2

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView

class NotificationActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notification)
        val textView = findViewById<TextView>(R.id.txtNotificationData)
        val dataToDisplay = intent.getStringExtra("data")
        textView.text = dataToDisplay
        //navigate to the normal notification fragment
    }
}