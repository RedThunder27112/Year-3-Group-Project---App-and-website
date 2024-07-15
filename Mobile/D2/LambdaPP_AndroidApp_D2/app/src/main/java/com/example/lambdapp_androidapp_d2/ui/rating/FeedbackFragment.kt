package com.example.lambdapp_androidapp_d2.ui.rating

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentFeedbackBinding
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Feedback
import com.example.lambdapp_androidapp_d2.models.Rating
import com.example.lambdapp_androidapp_d2.models.Task
import com.example.lambdapp_androidapp_d2.ui.Notifications.notificationViewModel
import retrofit2.Call
import retrofit2.Response


class FeedbackFragment : Fragment() {
    private var _binding: FragmentFeedbackBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private lateinit var viewModel: ratingViewModel
    private lateinit var imgProfilePic: ImageView
    private lateinit var txtComments: EditText
    private lateinit var ratingGroup: RadioGroup
    private lateinit var lblName : TextView
    private lateinit var listEmployees: MutableList<Employee>
    private var indexEmployees : Int = 0
    private lateinit var listRatings: MutableList<Rating>
    private lateinit var btnSubmit2 : Button
    //val ratingGroup = binding.ratingGroup
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentFeedbackBinding.inflate(inflater, container, false)


        imgProfilePic = binding.imgUser
        txtComments = binding.txtComments
        lblName = binding.lblName
        ratingGroup = binding.ratingGroup

        val task_id = ViewModelProvider(requireActivity())[notificationViewModel::class.java].getTaskID()
        viewModel = ViewModelProvider(requireActivity())[ratingViewModel::class.java]

        viewModel.setTask(task_id)
        val task = createTask(viewModel.getTaskID())
        btnSubmit2 = binding.btnSubmit2

        context?.resources?.let { btnSubmit2.setBackgroundColor(it.getColor(R.color.LightGrey,
            requireContext().resources.newTheme())) }

        context?.resources?.let { btnSubmit2.setTextColor(it.getColor(R.color.black,
            requireContext().resources.newTheme())) }

        btnSubmit2.isEnabled = false

        //////this is a temp bit as gettting id from other page isnt working atm

        indexEmployees = 0
        val taskID = viewModel.getTaskID()
        //var task = createTask(taskID)
        task.observe(viewLifecycleOwner) { observedTask ->
            if (observedTask != null) {
                val taskEmployees = getTaskEmployees(taskID)
                taskEmployees.observe(viewLifecycleOwner)
                {
                    Log.i("numbersss","onXXX")
                    if (it != null)
                    {
                        Log.i("numbersss","onXXXs")
                        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
                        listEmployees = it as MutableList<Employee>
                        listEmployees.removeIf { e -> e.emp_ID == userID }
                        displayNewEmployeeToReview(binding.btnSubmit)

                        //if (it.isEmpty())
                        //viewModel.showText("No team members found!",employeesLayout, this.requireContext())

                       //this creates radio buttons 1-5, for each employee

                    }
                }

            }
        }
        //createRadioButton()

        listRatings = mutableListOf()
        val btnSubmit = binding.btnSubmit
        btnSubmit.setOnClickListener {
            val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
            if(indexEmployees < listEmployees.size)//going through a list of each employee
            {

                val rating = Rating()
                rating.emp_ID = listEmployees[indexEmployees].emp_ID
                rating.reviewer_ID = userID
                rating.task_ID = viewModel.getTaskID()
                rating.rating_Comment = txtComments.text.toString()

                if (ratingGroup.checkedRadioButtonId != -1)//checking if radio button is clicked
                {
                    if(R.id.radioButton == ratingGroup.checkedRadioButtonId)
                    {
                        rating.rating_Rating = 1
                    }
                    if(R.id.radioButton2 == ratingGroup.checkedRadioButtonId)
                    {
                        rating.rating_Rating = 2
                    }
                    if(R.id.radioButton3 == ratingGroup.checkedRadioButtonId)
                    {
                        rating.rating_Rating = 3
                    }
                    if(R.id.radioButton4 == ratingGroup.checkedRadioButtonId)
                    {
                        rating.rating_Rating = 4
                    }
                    if(R.id.radioButton5 == ratingGroup.checkedRadioButtonId)
                    {
                        rating.rating_Rating = 5
                    }
                }else
                {
                    rating.rating_Rating = -1
                }

                ratingGroup.clearCheck()

                listRatings.add(rating)
                indexEmployees++
                Log.i("sizeofRatAdd",listRatings.size.toString())

                displayNewEmployeeToReview(btnSubmit)

            }else
            {
                sendRating(listRatings)

                val txtFeedback = binding.txtFeedback
                val feedback = Feedback()
                feedback.emp_ID = userID
                feedback.task_ID = viewModel.getTaskID()
                feedback.feedback_Feedback = txtFeedback.text.toString()

                sendFeedback(feedback)

                findNavController().popBackStack()

                //root.findNavController().navigate(R.id.action_nav_feedback_to_nav_home)
            }



            val btnUndo = binding.btnUndo

            btnUndo.setOnClickListener()
            {
                if(indexEmployees > 0)
                {
                    Log.i("sizeofRatMinus",listRatings.size.toString())

                    var count = -1
                    for(r: Rating in listRatings)
                    {
                        count++
                    }

                    if(count == 0)
                    {
                        indexEmployees = count
                        listRatings.removeAt(count)
                        displayNewEmployeeToReview(btnSubmit)

                    }else
                        if(count == -1)
                        {
                            //do nothing
                        }else
                        {
                            indexEmployees = count-1
                            listRatings.removeAt(count)
                            displayNewEmployeeToReview(btnSubmit)
                        }

                }

            }

        }

        btnSubmit2.setOnClickListener {
            val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
            if (indexEmployees < listEmployees.size)//going through a list of each employee
            {

                val rating = Rating()
                rating.emp_ID = listEmployees[indexEmployees].emp_ID
                rating.reviewer_ID = userID
                rating.task_ID = viewModel.getTaskID()
                rating.rating_Comment = txtComments.text.toString()

                if (ratingGroup.checkedRadioButtonId != -1)//checking if radio button is clicked
                {
                    if (R.id.radioButton == ratingGroup.checkedRadioButtonId) {
                        rating.rating_Rating = 1
                    }
                    if (R.id.radioButton2 == ratingGroup.checkedRadioButtonId) {
                        rating.rating_Rating = 2
                    }
                    if (R.id.radioButton3 == ratingGroup.checkedRadioButtonId) {
                        rating.rating_Rating = 3
                    }
                    if (R.id.radioButton4 == ratingGroup.checkedRadioButtonId) {
                        rating.rating_Rating = 4
                    }
                    if (R.id.radioButton5 == ratingGroup.checkedRadioButtonId) {
                        rating.rating_Rating = 5
                    }
                } else {
                    rating.rating_Rating = -1
                }

                ratingGroup.clearCheck()

                listRatings.add(rating)
                indexEmployees++
                Log.i("sizeofRatAdd", listRatings.size.toString())

                displayNewEmployeeToReview(btnSubmit)

            } else {
                sendRating(listRatings)

                val txtFeedback = binding.txtFeedback
                val feedback = Feedback()
                feedback.emp_ID = userID
                feedback.task_ID = viewModel.getTaskID()
                feedback.feedback_Feedback = txtFeedback.text.toString()

                sendFeedback(feedback)

                findNavController().popBackStack()

                //root.findNavController().navigate(R.id.action_nav_feedback_to_nav_home)
            }
        }


        //button for getting chosen radio button, and changing image
        //--need to add image as well
        //


        return binding.root

    }

    private fun displayNewEmployeeToReview(btnSubmit: ImageButton) {


        Log.i("indexEmpl",indexEmployees.toString())
        Log.i("listEmployees.size",listEmployees.size.toString())
        if (indexEmployees == listEmployees.size)//if past end
        {
            context?.resources?.let { btnSubmit2.setBackgroundColor(it.getColor(R.color.PastelRed,
                requireContext().resources.newTheme())) }

            context?.resources?.let { btnSubmit2.setTextColor(it.getColor(R.color.white,
                requireContext().resources.newTheme())) }

            btnSubmit2.isEnabled = true
        } else {
            ApiConnectionManager.loadProfilePic(
                this.requireContext(),
                listEmployees[indexEmployees].emp_ID,
                imgProfilePic
            )
            imgProfilePic.setOnClickListener {
                ApiConnectionManager.showImageDialog(
                    requireContext(),
                    ApiConnectionManager.ProfilePicIp(listEmployees[indexEmployees].emp_ID)
                )
            }
            lblName.text = "${listEmployees[indexEmployees].emp_Name} ${listEmployees[indexEmployees].emp_Sur}"
            txtComments.setText("")
            ratingGroup.clearCheck()
            if ((indexEmployees) == listEmployees.size)
            {
                context?.resources?.let { btnSubmit2.setBackgroundColor(it.getColor(R.color.PastelRed,
                    requireContext().resources.newTheme())) }

                context?.resources?.let { btnSubmit2.setTextColor(it.getColor(R.color.white,
                    requireContext().resources.newTheme())) }

                btnSubmit2.isEnabled = true

            }else
            {
                context?.resources?.let { btnSubmit2.setBackgroundColor(it.getColor(R.color.LightGrey,
                    requireContext().resources.newTheme())) }

                context?.resources?.let { btnSubmit2.setTextColor(it.getColor(R.color.black,
                    requireContext().resources.newTheme())) }

                btnSubmit2.isEnabled = false
            }



        }
    }

    /*private fun createRadioButton() {

                for (i in 1..5)//they have 1-5 buttons
                {
                    val rb = RadioButton(this.requireContext())
                    rb.text = i.toString()
                    rb.id = i
                    ratingGroup.addView(rb)
                    Log.i("numbersss",i.toString())
                }
    }*/

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

    private fun createTask(taskID: Int): LiveData<Task>
    {
        val task = MutableLiveData<Task>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out
            conManager.getTask( taskID, object : retrofit2.Callback<Task> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Task>,
                    response: Response<Task>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        value = response.body()
                        //rename the title of the activity to the task name
                        value?.let { }
                    } else
                        value = null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Task>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }

    /*private fun selectRatingMessage()
    {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, "Please Select a Rating", Toast.LENGTH_LONG)
            .show()
    }*/

    private fun successMessage()
    {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, "Ratings Successfully Recorded", Toast.LENGTH_LONG)
            .show()
    }

    private fun failureMessage()
    {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, "Something Went Wrong with Recording the Ratings. Please Try Again Later", Toast.LENGTH_LONG)
            .show()
    }


    private fun sendRating(listRating : List<Rating>)
    {

        //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.postRating(listRating, object : retrofit2.Callback<Int> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Int>,
                    response: Response<Int>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful)
                    {
                        response.body()
                        successMessage()
                    } else
                    {
                        failureMessage()
                    }

                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Int>, t: Throwable) {
                    Log.i("errMsg",t.message.toString())
                    failureMessage()
                }
            })


    }

    private fun sendFeedback(feedback: Feedback)
    {

        //create the connection manager
        val conManager = ApiConnectionManager()
        //run the get function - gotta override the callback object's 2 functions,
        // so we wait until a response is received or the connection fails/times out

        conManager.postFeedback(feedback, object : retrofit2.Callback<Int> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Int>,
                response: Response<Int>
            ) {
                //check if the response was successful
                if (response.isSuccessful)
                {
                    response.body()
                    //successMessage()
                } else
                {
                    //failureMessage()
                }

            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Int>, t: Throwable) {
                Log.i("errMsg",t.message.toString())
                //failureMessage()
            }
        })


    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
