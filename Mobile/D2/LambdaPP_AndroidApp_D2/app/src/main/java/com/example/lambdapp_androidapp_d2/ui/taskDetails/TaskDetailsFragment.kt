package com.example.lambdapp_androidapp_d2.ui.taskDetails

import android.annotation.SuppressLint
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.text.HtmlCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentTaskDetailsBinding
import com.example.lambdapp_androidapp_d2.models.*
import retrofit2.Call
import retrofit2.Response
import java.util.*


class TaskDetailsFragment : Fragment() {

    private var _binding: FragmentTaskDetailsBinding? = null

    private lateinit var viewModel: TaskDetailsViewModel

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    private lateinit var btnPostUpdate: Button
    private lateinit var lblTaskDescription : TextView
    private lateinit var lblStatusText : TextView
    private lateinit var lblDue : TextView
    private lateinit var timelineLayout : LinearLayout

    @SuppressLint("SimpleDateFormat")
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentTaskDetailsBinding.inflate(inflater, container, false)

        val root: View = binding.root

        btnPostUpdate = binding.btnPostUpdate
        lblTaskDescription = binding.lblDescriptionText

        timelineLayout = binding.TimelineLayout
        //val TimelineObject = binding.timeline

        lblStatusText = binding.lblstatus
        lblDue = binding.lblDue

        viewModel = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java]

        viewModel.task.observe(viewLifecycleOwner) { observedTask ->
            displayTask(observedTask)
        }

        btnPostUpdate.setOnClickListener {
            /*val result2 = Bundle()
            result2.putInt("taskID", taskID)
            requireActivity().supportFragmentManager.setFragmentResult("selectedTask", result2) //no longer needed, just using view model*/
            root.findNavController()
                .navigate(R.id.action_nav_taskDetailsParent_to_nav_addTimelineUpdate)
        }



        return binding.root

    }

    @SuppressLint("SimpleDateFormat")
    private fun displayTask(observedTask: Task?) {
        if (observedTask != null) {

            lblTaskDescription.text = HtmlCompat.fromHtml(
                observedTask.task_Description + "<br><br><b>Activity: " + observedTask.activity.act_Name + "</b>",
                HtmlCompat.FROM_HTML_MODE_COMPACT
            )
            lblStatusText.text =
                HtmlCompat.fromHtml(
                    "<b>${getText(R.string.statusheading)}</b> ${observedTask.status.status_Name}",
                    HtmlCompat.FROM_HTML_MODE_COMPACT
                )

            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            val outputFormat = SimpleDateFormat("EEEE d MMMM yyyy", Locale.ENGLISH)
            val date = inputFormat.parse(observedTask.task_Deadline)
            //overdue if over due date + not complete
            if (date.before(GregorianCalendar.getInstance().time) && observedTask.status.status_Name != getString(
                    R.string.completed_from_db
                )
            )
                lblDue.text = HtmlCompat.fromHtml(
                    "<b>Due:</b> " + outputFormat.format(date) + " <b>(OVERDUE!)</b>",
                    HtmlCompat.FROM_HTML_MODE_COMPACT
                )
            else
                lblDue.text = HtmlCompat.fromHtml(
                    "<b>Due:</b> " + outputFormat.format(date),
                    HtmlCompat.FROM_HTML_MODE_COMPACT
                )
            //updates
            val taskUpdates = getTaskUpdates(observedTask.task_ID)
            taskUpdates.observe(viewLifecycleOwner)
            {
                if (it != null) {
                    if (it.isEmpty()) {
                        timelineLayout.removeAllViews()
                        viewModel.showText("No updates yet!", timelineLayout, requireContext())
                    } else {
                        //we have a list of our timeline updates. Want to add them to the timeline which is the recycler view
                        val recyclerView =
                            view?.findViewById<RecyclerView>(androidx.preference.R.id.recycler_view)

                        //we create a linear layout manager to lay out the timeline linearly
                        //and a specialised adapter that tells it how to render the list
                        if (recyclerView != null) {
                            recyclerView.layoutManager =
                                LinearLayoutManager(
                                    this.requireContext(),
                                    RecyclerView.VERTICAL,
                                    false
                                )
                            recyclerView.adapter =
                                TimeLineAdapter(it, requireActivity().supportFragmentManager)

                        } else {
                            Log.e("Timeline", "recyclerview is null!")
                        }
                        /*for (t: Task_Update in it)
                            {
                                //addButton(t, TimelineLayout)
                                //TimelineObject.marker = VectorDrawableCompat.create(holder.itemView.context.resources, drawableResId, holder.itemView.context.theme)
                            }*/
                    }
                }
            }
        }
    }

    private fun getTaskUpdates(taskID: Int): LiveData<List<Task_Update>>
    {
        val task = MutableLiveData<List<Task_Update>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskUpdates( taskID, object : retrofit2.Callback<MutableList<Task_Update>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Task_Update>>,
                    response: Response<MutableList<Task_Update>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Task_Update>>, t: Throwable) {
                    value = null
                }
            })
        }
        return task
    }

    //old method for making timeline entries, before we had the recyclerview
    /*private fun addButton(t: Task_Update, linearLayout: LinearLayout) {
        val b = Button(this.context)
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
        val outputFormat = SimpleDateFormat("MM/dd HH")
        val date = inputFormat.parse(t.update_Time)
        b.text =outputFormat.format(date)+ ": " +  t.update_Description
        linearLayout.addView(b)
        b.setOnClickListener {
            val Result = Bundle()
            Result.putInt("taskUpdateID",t.update_ID)
            requireActivity().supportFragmentManager.setFragmentResult("selectedTaskUpdate",Result)
            binding.root.findNavController().navigate(R.id.action_nav_taskDetails_to_nav_update_timeline)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val afterTextChangedListener = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
                // ignore
            }
            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                // ignore
            }
            override fun afterTextChanged(s: Editable) {
            }
        }
    }*/

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    override fun onResume() {
        super.onResume()
        val recyclerView =
            view?.findViewById<RecyclerView>(androidx.preference.R.id.recycler_view)
        if (recyclerView != null)
        {
            recyclerView.adapter = null
        }

        viewModel.task.observe(viewLifecycleOwner) { observedTask ->
            displayTask(observedTask)
        }


        /*val pFragment = (this. as TabLayout.TabView).tab?.parent
        if (pFragment != null)
        {
            pFragment.findFragment<TaskDetailsParent>().onResume()
            Log.d("Refreshing",pFragment.toString())
        }
        else
            Log.d("Refreshing", "onResume: no parent fragment")*/
        //parentListener?.onChildFragmentInteraction()
    }

    /*private var parentListener: ParentFragmentListener? = null

    override fun onAttach(context: Context) {
        super.onAttach(context)
       if (context is ParentFragmentListener) {
            parentListener = context
        } else {
            throw RuntimeException(
                context.toString()
                        + " must implement ParentFragmentListener"
            )
        }

    }*/
}