package com.example.lambdapp_androidapp_d2.ui.updateUserDetails

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter


class UpdateAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {
    override fun getItemCount(): Int {
        return 2
    }

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> UpdateProfile()
            1 -> UpdateProfileRatingFragment()
            else -> UpdateProfile()
        }

    }
}