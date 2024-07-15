package com.example.lambdapp_androidapp_d2.ui.taskDetails

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.findFragment
import androidx.lifecycle.ViewModelProvider
import androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback
import com.example.lambdapp_androidapp_d2.MainActivity
import com.example.lambdapp_androidapp_d2.databinding.FragmentTaskDetailsParentBinding
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayout.OnTabSelectedListener

class TaskDetailsParent : Fragment() {

    private lateinit var viewModel: TaskDetailsViewModel
    private var _binding: FragmentTaskDetailsParentBinding? = null
    private val binding get() = _binding!!

    private lateinit var myViewPageAdapter: TabsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentTaskDetailsParentBinding.inflate(inflater, container, false)

        viewModel = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java]

        myViewPageAdapter = TabsAdapter(requireActivity())

        //set up the tabs and adaptor
        val tabLayout = binding.taskDetailsTabLayout
        val viewPager = binding.taskDetailsViewPager
        viewPager.adapter = myViewPageAdapter

        tabLayout.addOnTabSelectedListener( object: OnTabSelectedListener{
            override fun onTabSelected(tab: TabLayout.Tab?) {
                if (tab != null) {
                    viewPager.currentItem = tab.position
                    tab.view.findFragment<Fragment>().onResume()
                    onResume()
                }
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {
            }

            override fun onTabReselected(tab: TabLayout.Tab?) {
                if (tab != null) {
                    tab.view.findFragment<Fragment>().onResume()
                    onResume()
                }
            }
        })
        //set the view pager to also change the tab if the user just swipes to change tabs
        viewPager.registerOnPageChangeCallback(object: OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                tabLayout.getTabAt(position)?.select()
            }
        })

        //tabLayout.getTabAt(tabLayout.selectedTabPosition).view.tab


        //so the pattern that works, if you have multiple of these in a navigation row, is parentfragmentmanager -> requireActivity().supportFragmentManager -> parentfragmentmanager again
        requireActivity().supportFragmentManager.setFragmentResultListener("selectedTask",this) { _: String, Result: Bundle ->
            val taskID = Result.getInt("taskID")
            viewModel.setTask(taskID, (requireActivity() as MainActivity))

        }

        binding.btnReset.setOnClickListener {
            onResume()}
        return binding.root
    }


    override fun onResume() {
        super.onResume()
        viewModel = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java]
        viewModel.refreshTask()
    }

    /*override fun onChildFragmentInteraction() {
        onResume()
    }*/

}

/*interface ParentFragmentListener {
    fun onChildFragmentInteraction()
}*/