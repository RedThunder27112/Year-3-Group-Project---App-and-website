package com.example.lambdapp_androidapp_d2.ui.updateUserDetails

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback
import com.example.lambdapp_androidapp_d2.MainActivity
import com.example.lambdapp_androidapp_d2.databinding.FragmentTaskDetailsParentBinding
import com.example.lambdapp_androidapp_d2.databinding.FragmentUpdateProfileParentBinding
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayout.OnTabSelectedListener

class UpdateProfileParent : Fragment() {

    private lateinit var viewModel: updateprofileViewModel
    private var _binding: FragmentUpdateProfileParentBinding? = null
    private val binding get() = _binding!!

    private lateinit var myViewPageAdapter: UpdateAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentUpdateProfileParentBinding.inflate(inflater, container, false)

        viewModel = ViewModelProvider(requireActivity())[updateprofileViewModel::class.java]
        viewModel.setEmployeeSkills()
        myViewPageAdapter = UpdateAdapter(requireActivity())

        //set up the tabs and adaptor
        val tabLayout = binding.updateProfileTabLayout
        val viewPager = binding.updateProfileViewPager
        viewPager.adapter = myViewPageAdapter

        tabLayout.addOnTabSelectedListener( object: OnTabSelectedListener{
            override fun onTabSelected(tab: TabLayout.Tab?) {
                if (tab != null) {
                    viewPager.currentItem = tab.position
                }
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {
            }

            override fun onTabReselected(tab: TabLayout.Tab?) {
            }
        })
        //set the view pager to also change the tab if the user just swipes to change tabs
        viewPager.registerOnPageChangeCallback(object: OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                tabLayout.getTabAt(position)?.select()
            }
        })
/*
        //so the pattern that works, if you have multiple of these in a navigation row, is parentfragmentmanager -> requireActivity().supportFragmentManager -> parentfragmentmanager again
        requireActivity().supportFragmentManager.setFragmentResultListener("selectedTask",this) { _: String, Result: Bundle ->
            val taskID = Result.getInt("taskID")
            viewModel.setTask(taskID, (requireActivity() as MainActivity))

        }*/

        binding.btnReset.setOnClickListener {viewModel.refreshTask()}
        return binding.root
    }


    override fun onResume() {
        super.onResume()
        viewModel.refreshTask()
    }

}