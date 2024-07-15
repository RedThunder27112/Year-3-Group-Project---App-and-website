package com.example.lambdapp_androidapp_d2.ui.userinfo

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentUserinfoBinding
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Task
import retrofit2.Call
import retrofit2.Response
class userinfoFragment : Fragment() {

    private var _binding: FragmentUserinfoBinding? = null
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

        _binding = FragmentUserinfoBinding.inflate(inflater, container, false)
        val root: View = binding.root

        val btnUpdateDetails = binding.btnUpdateDetails

        val lblUsername = binding.lblUsername
        val lblName = binding.lblName
        val lblRating = binding.lblRating
        val lblSurname = binding.lblSurname
        val lblCompletedTasks = binding.lblCompletedTask
        val lblSupervisedTasks = binding.lblSupervisorTask
        val imgProfilePic = binding.imgUser

        btnUpdateDetails.setOnClickListener {
            Log.i("tagggg","tasssssgsfasd")
            root.findNavController().navigate(R.id.action_nav_userinfoParent_to_nav_updateProfileParent)
        }

        //val textView: TextView = binding.textGallery

        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out

        var completedTasks = 0
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        conManager.getEmployeeCompletedTasks( userID, object : retrofit2.Callback<MutableList<Task>> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<MutableList<Task>>,
                response: Response<MutableList<Task>>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    completedTasks = getNumTasks(response.body())
                }
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<MutableList<Task>>, t: Throwable) {
            }
        })

        userinfoViewModel.employee.observe(viewLifecycleOwner) {
            if (it != null)
            {
                lblUsername.text = "Email: " + it.emp_Username
                lblName.text = "Name: " + it.emp_Name
                lblSurname.text = "Surname: " + it.emp_Sur

                if(it.emp_Rating != null && it.emp_Rating > 0)
                {
                    lblRating.text = "Rating: " + it.emp_Rating
                }else
                {
                    lblRating.text = "Rating: N/A"
                }

                lblCompletedTasks.text = "Completed Tasks: " + completedTasks;

                //api functionality needed: Get avg rating, get count of completed tasks, get count supervised tasks

                //loading image:
                ApiConnectionManager.loadProfilePic(this.requireContext(),it.emp_ID, imgProfilePic)
                imgProfilePic.setOnClickListener{_:View ->
                    ApiConnectionManager.showImageDialog(requireContext(),ApiConnectionManager.ProfilePicIp(it.emp_ID))
                }
            }
        }


        return root

    }

    fun getNumTasks(it: List<Task>?) : Int
    {
        if (it != null)
        {
            if (it.isEmpty())
               return 0
            else
                return it.size

        }

        return 0
    }

    private fun getEmployee() : MutableLiveData<Employee>
    {
        val employee = MutableLiveData<Employee>().apply {
            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
            conManager.getEmployee(userID, object : retrofit2.Callback<Employee> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Employee>,
                    response: Response<Employee>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }

                //failure - an exception t was encountered
                override fun onFailure(call: Call<Employee>, t: Throwable) {
                }
            })
        }
        //userinfoViewModel.refreshTask()
        return employee

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