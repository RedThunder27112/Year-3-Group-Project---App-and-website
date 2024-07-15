package com.example.lambdapp_androidapp_d2.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.MainActivity
import com.example.lambdapp_androidapp_d2.R

class LogoutFragment : Fragment() {



    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        MainActivity.updateMenu(false)
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_logout, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findNavController().navigate(R.id.action_nav_logout_to_nav_splashscreen)
    }

}