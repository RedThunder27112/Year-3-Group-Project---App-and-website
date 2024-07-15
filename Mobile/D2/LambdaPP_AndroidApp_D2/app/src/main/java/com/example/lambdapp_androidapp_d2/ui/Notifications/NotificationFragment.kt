package com.example.lambdapp_androidapp_d2.ui.Notifications

import android.content.Context
import com.example.lambdapp_androidapp_d2.models.*
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentNotificationBinding
import retrofit2.Call
import retrofit2.Response
import java.util.*


class NotificationFragment : Fragment() {
    private var _binding: FragmentNotificationBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private lateinit var viewModel: notificationViewModel
    private lateinit var btnClearViewed: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentNotificationBinding.inflate(inflater, container, false)

        val notificationLayout = binding.NotificationLayout
        //binding.root.findNavController().navigate(R.id.action_nav_notifications_to_nav_feedback)
///////////////////////
        //so the pattern that works, if you have multiple of these in a navigation row, is parentfragmentmanager -> requireActivity().supportFragmentManager -> parentfragmentmanager again
       // parentFragmentManager.setFragmentResultListener("selectedNotification",this) { _: String, Result: Bundle ->
            val empID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
           // val empID = Result.getInt("empID")
            viewModel = ViewModelProvider(requireActivity())[notificationViewModel::class.java]

            viewModel.getNotifications(empID)




        Log.i("flagtest","1x")
        viewModel.notification.observe(viewLifecycleOwner) { observedNotification ->
                if (observedNotification != null) {
                    Log.i("flagtest","2x")
                    viewModel.notification.observe(viewLifecycleOwner)
                    {
                        if (it != null) {
                            if (it.isEmpty())
                                showText("No updates yet!", notificationLayout)
                            for (t: Notification in it)
                            {
                                context?.let { it1 -> addButton(t, notificationLayout, it1) }
                            }

                        }

                    }
                }
            }

       // }
        /////////////////////
        btnClearViewed = binding.btnClearViewed

        btnClearViewed.setOnClickListener {
            clearViewed()
            binding.root.findNavController().popBackStack()
            clearViewed()
            binding.root.findNavController().navigate(R.id.nav_notifications)
            clearViewed()

            clearViewed()
            binding.root.findNavController().popBackStack()
            clearViewed()
            binding.root.findNavController().navigate(R.id.nav_notifications)
            clearViewed()

        }


        return binding.root

    }


    private fun getIfTaskRated(empID: Int, notification: Notification): MutableLiveData<Int>
    {
        val rated = MutableLiveData<Int>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getIfTaskRated(empID, notification.task_ID, object : retrofit2.Callback<Int> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Int>,
                    response: Response<Int>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Int>, t: Throwable) {
                    value = null
                }
            })
        }
        return rated
    }

    private fun getNotifications(empID: Int): LiveData<List<Notification>>
    {
        val notification = MutableLiveData<List<Notification>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getNotifications( empID, object : retrofit2.Callback<MutableList<Notification>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Notification>>,
                    response: Response<MutableList<Notification>>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        value = response.body()
                        Log.i("tagProp","1")
                    } else
                    {
                        Log.i("tagProp","2")
                        value = null
                    }

                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Notification>>, t: Throwable) {
                    value = null
                }
            })
        }
        return notification
    }
    private fun addButton(t: Notification, linearLayout: LinearLayout,context: Context) {
        val b = Button(this.context)
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH)
        val outputFormat = SimpleDateFormat("MM/dd ha", Locale.ENGLISH)
        val date = inputFormat.parse(t.not_Date)
        "${outputFormat.format(date)}: ${t.not_Description}".also { b.text = it }

        if(t.not_Viewed)
        {
            Log.i("greysss","2")
            b.background.setTint(context.resources.getColor(R.color.LightGrey,context.resources.newTheme()))
        }else
        {
            b.background.setTint(context.resources.getColor(R.color.PaleBlue,context.resources.newTheme()))
            Log.i("greysss","1")
        }


        val isRated = getIfTaskRated(t.emp_ID, t)

        Log.i("flagtest","1")
        isRated.observe(viewLifecycleOwner)
        { observedFlag ->
            if(observedFlag != null)
            {
                b.setOnClickListener {
                    //val result = Bundle()
                    //result.putInt("notID",t.not_ID)
                    //requireActivity().supportFragmentManager.setFragmentResult("selectedNotification",result)
                    sendNotification(t.not_ID)
                    Log.i("NotTest",t.not_ID.toString())
                    Log.i("NotTest",t.not_Description)
                    Log.i("NotTest",t.task_ID.toString())
                    if(t.not_Description.lowercase().contains("completed:"))
                    {
                        if(observedFlag == -1)
                        {
                            viewModel.setTaskID(t.task_ID)
                            binding.root.findNavController().navigate(R.id.action_nav_notifications_to_nav_feedback)
                        }else
                        {
                            Toast.makeText(requireContext(),"Task Already Rated",Toast.LENGTH_LONG).show()
                        }

                    }else
                    {

                        val result = Bundle()
                        result.putInt("taskID",t.task_ID)
                        requireActivity().supportFragmentManager.setFragmentResult("selectedTask",result)
                        binding.root.findNavController().navigate(R.id.action_nav_notifications_to_nav_taskDetailsParent)
                    }

                }
            }else
            {
                b.setOnClickListener {
                    //val result = Bundle()
                    //result.putInt("notID",t.not_ID)
                    //requireActivity().supportFragmentManager.setFragmentResult("selectedNotification",result)
                    sendNotification(t.not_ID)

                    if(t.not_Description.lowercase().contains("completed:"))
                    {
                        //if(flag == 1)
                        //{
                        viewModel.setTaskID(t.task_ID)
                        binding.root.findNavController().navigate(R.id.action_nav_notifications_to_nav_feedback)
                        //}

                    }else
                    {
                        val result = Bundle()
                        result.putInt("taskID",t.task_ID)
                        requireActivity().supportFragmentManager.setFragmentResult("selectedTask",result)
                        binding.root.findNavController().navigate(R.id.action_nav_notifications_to_nav_taskDetailsParent)
                    }

                }
            }
        }

        linearLayout.addView(b,0)



    }


    private fun sendNotification(notID: Int) {


        val conManager = ApiConnectionManager()
        //get statuses
        conManager.postNotificationViewed(notID, object : retrofit2.Callback<Int> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Int>,
                response: Response<Int>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    Log.d("location", "successful notification sent")
                } else {
                    Log.d("location", "no notification sent")
                }
            }

            //failure - an exception t was encountered
            override fun onFailure(call: Call<Int>, t: Throwable) {
                t.printStackTrace()
            }
        })

    }

    private fun clearViewed() {

        val empID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        val conManager = ApiConnectionManager()
        //get statuses
        conManager.postClearNotifications(empID, object : retrofit2.Callback<Int> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Int>,
                response: Response<Int>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    Log.d("location", "successful notification sent")
                } else {
                    Log.d("location", "no notification sent")
                }
            }

            //failure - an exception t was encountered
            override fun onFailure(call: Call<Int>, t: Throwable) {
                t.printStackTrace()
            }
        })

    }



    private fun showText(text: String, linearLayout: LinearLayout)
    {
        val txtView = TextView(this.context)
        txtView.text = text
        linearLayout.addView(txtView)
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    override fun onResume() {
        super.onResume()
    }
}
