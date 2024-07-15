package com.example.lambdapp_androidapp_d2.ui.taskDetails

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter

class TabsAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
    override fun getItemCount(): Int {
        return 3
    }

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> TaskDetailsFragment()
            1 -> TaskDetailsResourcesFragment()
            2 -> TaskDetailsTeamFragment()
            else -> TaskDetailsTeamFragment()
        }

    }
}