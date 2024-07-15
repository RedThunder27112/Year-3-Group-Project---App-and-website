package com.example.lambdapp_androidapp_d2

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.ActivityMainBinding
import com.google.android.material.navigation.NavigationView
import com.google.android.material.snackbar.Snackbar

class MainActivity : AppCompatActivity() {

    private val NOTIFICATION_PERMISSION_REQUEST_CODE = 101

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    //private lateinit var appBarMainBinding: AppBarMainBinding


    companion object {
        fun updateMenu(isVisible: Boolean) {
            menu2.setVisible(isVisible)
        }

        lateinit var context: Context
        lateinit var menu2 : MenuItem
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        context = applicationContext
        binding = ActivityMainBinding.inflate(layoutInflater)

        setContentView(binding.root)
        setSupportActionBar(binding.appBarMain.toolbar)

        //request notification permissions

        requestNotificationPermissions()


        binding.appBarMain.fab.setOnClickListener { view ->
            Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                    .setAction("Action", null).show()

        }

        val drawerLayout: DrawerLayout = binding.drawerLayout
        val navView: NavigationView = binding.navView
        val navController = findNavController(R.id.nav_host_fragment_content_main)

        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        appBarConfiguration = AppBarConfiguration(setOf(
                R.id.nav_home, R.id.nav_completed_tasks, R.id.nav_userinfoParent, R.id.nav_calendar, R.id.nav_requestApproval), drawerLayout)


        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)


        // Check if we got here via pressing a notification, and we want to direct to the notification fragment
        val fragmentToOpen = intent.getStringExtra("fragmentToOpen")
        if (fragmentToOpen == "NotificationFragment") {
            // Open the NotificationFragment
            /*val transaction = supportFragmentManager.beginTransaction()
            transaction.replace(R.id.fragmentContainer, NotificationFragment())
            transaction.commit()*/
            navController.navigate(R.id.nav_notifications)
        }

    }


    fun requestNotificationPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
        {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                // We don't have the permissions, so request them
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(
                        Manifest.permission.POST_NOTIFICATIONS
                    ),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
                //from here the result is handled by onRequestPermissionResult
                ActivityCompat.OnRequestPermissionsResultCallback { i: Int, strings: Array<String?>, ints: IntArray ->
                    handleRequestPermissionsResult(i,strings,ints)
                }
            } else {
                // Permissions are already granted, handle the image selection
                startNotificationService()
            }
        }
        else
        {
            Log.d("Notification Permissions", "requestNotificationPermissions: old version of android!")
            startNotificationService()
        }
    }

    // handle where the user grants or rejects the location permission


    fun handleRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String?>,
        grantResults: IntArray
    ) {
        Log.d("RequestPermissions","Request Permission result received")
        //location management
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("RequestPermissions", "Notification permission granted")
                startNotificationService()
            }
            else
            {
                Log.d("RequestPermissions","Notification permission not granted")
                Toast.makeText(context, "Notification permission not granted", Toast.LENGTH_SHORT)
                    .show()
            }
        }
        else
        {
            Log.d("RequestPermissions","Unexpected request code $requestCode received")
        }

    }


    private fun startNotificationService() {
        val timer: AlarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val secondsBetweenChecks = 60
        //start the timer
        // Set up the AlarmManager to trigger every minute
        val intent = Intent(this, NotificationCheckReceiver::class.java)
        val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_MUTABLE)
        } else {
            PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        }

        val intervalMillis = (secondsBetweenChecks * 1000).toLong() // seconds * 1000 milliseconds in a second

        // Use RTC_WAKEUP to wake up the device if it's asleep
        // Adjust the starting time as needed
        val startTimeMillis = SystemClock.elapsedRealtime() + intervalMillis

        // Set the repeating alarm
        timer.setRepeating(
            AlarmManager.ELAPSED_REALTIME_WAKEUP,
            startTimeMillis,
            intervalMillis,
            pendingIntent
        )
    }


    //onpreparemenu, redoes menu at each fragment, instead of once in begining
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.

        if(menu != null)//as menu redone each time, this clears it before reading menu items
        {
            menu.clear()//might not be needed if i go back to createOptionMenu
        }


    menuInflater.inflate(R.menu.main, menu)

        val btnSetting = menu.getItem(0)
        btnSetting.isVisible = false
        btnSetting.setOnMenuItemClickListener{

            findNavController(R.id.nav_host_fragment_content_main).navigate(R.id.nav_setting)
            //findNavController(R.id.nav_host_fragment_content_main).navigate(R.id.nav_addTimelineUpdate)
            //the above is to skip stuff if im not running the server - you just swap the comments
            true
        }

        val btnNotification = menu.getItem(1)
        menu2 = btnNotification

        btnNotification.setOnMenuItemClickListener{
            findNavController(R.id.nav_host_fragment_content_main).navigate(R.id.nav_notifications)
            true
        }

        updateMenu(false)


        return true
    }


    fun renameTitle(title: String)
    {
        supportActionBar?.title = title
    }

    fun displayAdminStuffIfAdmin()
    {
        //display admin-only stuff
        val userIsAdmin= LoginRepository.getInstance()?.user?.isAdmin ?: false

        binding.navView.menu.findItem(R.id.nav_requestApproval).isVisible = userIsAdmin
    }




    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)

        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

}