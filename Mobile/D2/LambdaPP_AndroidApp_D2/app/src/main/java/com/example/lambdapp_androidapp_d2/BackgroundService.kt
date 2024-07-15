package com.example.lambdapp_androidapp_d2

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.icu.text.SimpleDateFormat
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.models.Notification
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.*


class BackgroundService : Service() {

    private var notificationsPreviously = -1
    private val conManager = ApiConnectionManager()
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        //the timer has said it's time to check for new notifications.
        Log.d("onStartCommand: ", "Notification check occurring!")
        //check for notifications
        //first check that the user has logged in
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        if (userID != -1)
        {
            //if notifications are found, send the push notification
            //how do we see if there are new notifications?
            //A: see if there are unread notifications. But do we want them to pop up every time we use the app? Or keep appearing every minute until they're read?
            //B: store the number of notifications from the previous check locally, then compare. If there are more notifications, show the new ones.
            //   what do we do the first time though?
            //   maybe a hybrid solution: first time we pop up all unread notifications, then we just compare to see if there are new ones
            if (notificationsPreviously == -1)
            {
                //we haven't displayed any notifications, so display all unread notifications
                displayAllUnreadNotifications(userID)
            }
            else
            {
                //we have displayed notifications, so check if there's more notifications
                checkIfHasNewNotifications(userID)
            }
        }

        return super.onStartCommand(intent, flags, startId)
    }

    private fun checkIfHasNewNotifications(userID: Int) {

        conManager.getNotificationCount(userID, object : Callback<Int> {
            override fun onResponse(
                call: Call<Int>,
                response: Response<Int>
            ) {
                if (response.isSuccessful) {
                    val numNotifications = response.body()
                    if (numNotifications != null)
                    {
                        //display new notifications
                        if (numNotifications > notificationsPreviously)
                            displayNewNotifications(userID, numNotifications - notificationsPreviously)
                        else
                            Log.d("Notifications", "onResponse: no new notifications")
                    }
                } else {
                    Log.e("Notifications", "onResponse: Error getting notification count")
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Int>, t: Throwable) {
                Log.e("Notifications", "onResponse: Error getting notification count")
            }
        })
    }

    private fun displayNewNotifications(userID: Int, numNewNotifications: Int) {
        //get the new notifications and display them
        conManager.getNewestNotifications(userID, numNewNotifications, object : Callback<MutableList<Notification>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            @RequiresApi(Build.VERSION_CODES.S)
            override fun onResponse(
                call: Call<MutableList<Notification>>,
                response: Response<MutableList<Notification>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    val unreadNotifications = response.body()
                    if (!unreadNotifications.isNullOrEmpty()) {
                        for (n in unreadNotifications)
                            createNotification(n)
                        //update the latest number of displayed notifications
                        updateNotificationCount(userID)
                    }
                } else {
                    Log.e("Notifications", "onResponse: Error getting unread notifications")
                }

            }

            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Notification>>, t: Throwable) {
                Log.e("Notifications", "onResponse: Error getting unread notifications")
            }
        })
    }

    private fun displayAllUnreadNotifications(userID: Int) {
        conManager.getUnreadNotifications(userID, object : Callback<MutableList<Notification>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            @RequiresApi(Build.VERSION_CODES.S)
            override fun onResponse(
                call: Call<MutableList<Notification>>,
                response: Response<MutableList<Notification>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    val unreadNotifications = response.body()
                    if (!unreadNotifications.isNullOrEmpty()) {

                        //we can't actually display all the notifications, can only display 1 at once. So display latest
                        unreadNotifications.sortBy { n: Notification -> n.not_Date }
                        createNotification(unreadNotifications.last(), unreadNotifications.size - 1)
                        updateNotificationCount(userID)
                    }
                } else {
                    Log.e("Notifications", "onResponse: Error getting unread notifications")
                }

            }

            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Notification>>, t: Throwable) {
                Log.e("Notifications", "onResponse: Error getting unread notifications")
            }
        })
    }




    private fun updateNotificationCount(userID: Int) {
        conManager.getNotificationCount(userID, object : Callback<Int> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Int>,
                response: Response<Int>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    if (response.body() != null)
                        notificationsPreviously = response.body()!!
                } else {
                    Log.e("Notifications", "onResponse: Error getting notification count")
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Int>, t: Throwable) {
                Log.e("Notifications", "onResponse: Error getting notification count")
            }
        })

    }

    @RequiresApi(Build.VERSION_CODES.S)
    private fun createNotification(n: Notification) {
        //don't create a notification that's already been viewed
        if (n.not_Viewed) return

        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH)
        val oldInfoFormat = SimpleDateFormat("MM/dd", Locale.ENGLISH)
        val todaysInfoFormat = SimpleDateFormat("HH:mm", Locale.ENGLISH)

        val dayFormat = SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH)
        val todaysDate = GregorianCalendar.getInstance().time

        val notificationDate =inputFormat.parse(n.not_Date)

        //notifications were either made today - new - or are old
        if (dayFormat.format(notificationDate) == dayFormat.format(todaysDate))
            createNotification(n.not_Description,"Posted today at ${todaysInfoFormat.format(notificationDate)}")
        else
            createNotification(n.not_Description,"Posted on ${oldInfoFormat.format(notificationDate)} at ${todaysInfoFormat.format(notificationDate)}")
    }
    @RequiresApi(Build.VERSION_CODES.S)
    private fun createNotification(n: Notification, numberOtherNotifications: Int) {
        if (n.not_Viewed) return

        if (numberOtherNotifications < 1) createNotification(n)
        else
        {
            createNotification(n.not_Description,"And $numberOtherNotifications other new notifications")
        }
    }

    @RequiresApi(Build.VERSION_CODES.S)
    private fun createNotification(title: String, text: String) {
        val channelID = "CHANNEL_ID_NOTIFICATION"

        // Create an intent to open MainActivity - we'll specify which fragment later
        val mainIntent = Intent(applicationContext, MainActivity::class.java)
        mainIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

        // Add extra info to open the NotificationFragment - Mainactivity will check for this
        mainIntent.putExtra("fragmentToOpen", "NotificationFragment")


        val pendingIntent = PendingIntent.getActivity(applicationContext,0,mainIntent, PendingIntent.FLAG_MUTABLE)

        //create the notification
        val builder = NotificationCompat.Builder(applicationContext,channelID)
            .setSmallIcon(R.drawable.logo)
            .setContentTitle(title)
            .setContentText(text)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
        {
            //try to see if this notification channel already exists
            var notificationChannel = notificationManager.getNotificationChannel(channelID)
            //if that channel didn't exist already, create it
            if (notificationChannel == null)
            {
                notificationChannel = NotificationChannel(channelID,"Notification Channel", NotificationManager.IMPORTANCE_HIGH)
                notificationChannel.lightColor = Color.GREEN
                notificationChannel.enableVibration(true)
                notificationManager.createNotificationChannel(notificationChannel)
            }
        }
        notificationManager.notify(0,builder.build())

    }

    override fun onBind(intent: Intent): IBinder? {
        //TO DO ("Return the communication channel to the service.")
        return null
    }
}