package com.example.lambdapp_androidapp_d2.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.findFragment
import androidx.lifecycle.ViewModelProvider
import com.example.lambdapp_androidapp_d2.databinding.FragmentHomeBinding
import androidx.viewpager2.widget.ViewPager2
import com.example.lambdapp_androidapp_d2.MainActivity
import com.google.android.material.tabs.TabLayout

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
            inflater: LayoutInflater,
            container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View {
        ViewModelProvider(requireActivity())[HomeViewModel::class.java]

        _binding = FragmentHomeBinding.inflate(inflater, container, false)

        MainActivity.updateMenu(true)
        val myViewPageAdapter = HomeAdapter(requireActivity())

        //set up the tabs and adaptor
        val tabLayout = binding.homeTabLayout
        val viewPager = binding.homeViewPager
        viewPager.adapter = myViewPageAdapter

        tabLayout.addOnTabSelectedListener( object: TabLayout.OnTabSelectedListener {
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
        viewPager.registerOnPageChangeCallback(object: ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                tabLayout.getTabAt(position)?.select()
            }
        })

        return binding.root
    }

    override fun onResume() {
        super.onResume()
        val homeViewModel =
            ViewModelProvider(requireActivity())[HomeViewModel::class.java]
        homeViewModel.refreshTasks()
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}