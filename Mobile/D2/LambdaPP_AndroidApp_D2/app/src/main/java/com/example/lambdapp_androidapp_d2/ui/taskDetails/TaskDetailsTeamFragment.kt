package com.example.lambdapp_androidapp_d2.ui.taskDetails

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.databinding.FragmentTaskDetailsTeamBinding
import com.example.lambdapp_androidapp_d2.models.Employee
import retrofit2.Call
import retrofit2.Response


class TaskDetailsTeamFragment : Fragment() {

    private var _binding: FragmentTaskDetailsTeamBinding? = null

    private lateinit var viewModel: TaskDetailsViewModel

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!



    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTaskDetailsTeamBinding.inflate(inflater, container, false)
        viewModel = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java]

        val employeesLayout = binding.TeamMembersLayout

        val taskID = viewModel.getTaskID()
        viewModel.task.observe(viewLifecycleOwner) { observedTask ->
            if (observedTask != null) {
                val taskEmployees = getTaskEmployees(taskID)
                taskEmployees.observe(viewLifecycleOwner)
                {
                    if (it != null) {
                        employeesLayout.removeAllViews()
                        if (it.isEmpty())
                            viewModel.showText("No team members found!",employeesLayout, this.requireContext())
                        else{
                            //get the supervisor
                            getTaskSupervisor(taskID).observe(viewLifecycleOwner)
                            { supervisor ->
                                employeesLayout.removeAllViews()
                                if (supervisor == null)
                                {
                                    for (e: Employee in it)
                                        DisplayEmployee(employeesLayout, e, false)
                                }
                                else
                                {
                                    for (e: Employee in it)
                                        DisplayEmployee(employeesLayout, e, e.emp_ID == supervisor.emp_ID)

                                }
                            }




                        }

                    }
                }

            }
        }
        return binding.root
    }


    private fun getTaskEmployees(taskID: Int): LiveData<List<Employee>>
    {
        val task = MutableLiveData<List<Employee>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskEmployees( taskID, object : retrofit2.Callback<MutableList<Employee>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Employee>>,
                    response: Response<MutableList<Employee>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Employee>>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }

    private fun DisplayEmployee(employeesLayout: LinearLayout, e: Employee, isSupervisor: Boolean) {
        val imageView = ImageView(this.requireContext())
        imageView.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        ApiConnectionManager.loadProfilePicSmall(this.requireContext(),e.emp_ID, imageView)
        imageView.setOnClickListener{
            ApiConnectionManager.showImageDialog(requireContext(),ApiConnectionManager.ProfilePicIp(e.emp_ID))
        }

        val textView = TextView(this.requireContext())
        textView.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )

        if (isSupervisor)
            "${e.emp_Name} ${e.emp_Sur} (Supervisor)".also { textView.text = it }
        else
            "${e.emp_Name} ${e.emp_Sur}".also { textView.text = it }

        val itemLayout = LinearLayout(this.requireContext())
        itemLayout.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        itemLayout.orientation = LinearLayout.HORIZONTAL
        itemLayout.addView(imageView)
        itemLayout.addView(textView)

        itemLayout.layout(50,50,50,58)
        employeesLayout.addView(itemLayout)
    }


    //this is for getting a task name for when making updates
    private fun getTaskSupervisor(taskID: Int): LiveData<Employee>
    {
        val employee = MutableLiveData<Employee>().apply {
            value = null
            val conManager = ApiConnectionManager()
            conManager.getTaskSupervisor( taskID, object : retrofit2.Callback<Employee> {
                override fun onResponse(
                    call: Call<Employee>,
                    response: Response<Employee>
                ) {
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Employee>, t: Throwable) {
                    value = null
                }
            })
        }
        return employee
    }
}