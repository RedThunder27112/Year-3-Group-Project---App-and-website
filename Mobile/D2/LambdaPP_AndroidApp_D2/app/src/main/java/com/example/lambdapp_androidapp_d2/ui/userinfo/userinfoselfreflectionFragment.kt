package com.example.lambdapp_androidapp_d2.ui.userinfo

import android.content.Context
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentUserinfoBinding
import com.example.lambdapp_androidapp_d2.databinding.FragmentUserinfoSelfreflectionBinding
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Feedback
import com.example.lambdapp_androidapp_d2.models.Notification
import com.example.lambdapp_androidapp_d2.models.Task
import retrofit2.Call
import retrofit2.Response
import java.util.Locale

class userinfoselfreflectionFragment : Fragment() {

    private var _binding: FragmentUserinfoSelfreflectionBinding? = null
    private lateinit var userinfoViewModel: userinfoViewModel
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
            inflater: LayoutInflater,
            container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View {
        userinfoViewModel = ViewModelProvider(requireActivity())[com.example.lambdapp_androidapp_d2.ui.userinfo.userinfoViewModel::class.java]

        _binding = FragmentUserinfoSelfreflectionBinding.inflate(inflater, container, false)
        val root: View = binding.root

        val ReflectionLayout = binding.ReflectionLayout

        //val textView: TextView = binding.textGallery

        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out

        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        Log.i("userID", userID.toString())
        conManager.getFeedback( userID, object : retrofit2.Callback<MutableList<Feedback>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<MutableList<Feedback>>,
                response: Response<MutableList<Feedback>>
            ) {
                var listFeedback : MutableList<Feedback>?
                //check if the response was successful
                if (response.isSuccessful) {
                    listFeedback = response.body()

                    if (listFeedback != null)
                    {
                        for(feedback : Feedback in listFeedback )
                        {
                            context?.let { addButton(feedback, ReflectionLayout, it) }

                        }
                    }


                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Feedback>>, t: Throwable) {
            }
        })



        return root

    }

    private fun addButton(t: Feedback, linearLayout: LinearLayout, context: Context) {

        if(t.feedback_Feedback.equals(""))
        {
            return
        }
        val b = Button(this.context)
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH)
        val outputFormat = SimpleDateFormat("MM/dd ha", Locale.ENGLISH)
        val date = inputFormat.parse(t.Feedback_Date)
        "${outputFormat.format(date)}: ${t.feedback_Feedback}".also { b.text = it }

        b.background.setTint(context.resources.getColor(R.color.PaleBlue,context.resources.newTheme()))


        linearLayout.addView(b,0)



    }


    override fun onResume() {
        super.onResume()
        userinfoViewModel.refreshTask()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}