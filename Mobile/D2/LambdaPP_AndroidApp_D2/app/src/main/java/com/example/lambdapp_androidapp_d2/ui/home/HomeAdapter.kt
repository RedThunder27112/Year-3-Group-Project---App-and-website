package com.example.lambdapp_androidapp_d2.ui.home

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter


class HomeAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
    override fun getItemCount(): Int {
        return 3
    }

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> RecentlyUpdatedTasksFragment()
            1 -> DueSoonTasksFragment()
            2 -> ActivitySortedTasksFragment()
            else -> RecentlyUpdatedTasksFragment()
        }

    }
}