package com.example.lambdapp_androidapp_d2.ui

import android.content.Context.MODE_PRIVATE
import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatDelegate
import androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode
import androidx.fragment.app.Fragment
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentSplashBinding


/**
 * A simple [Fragment] subclass.
 * Use the SplashScreenFragment.newInstance factory method to
 * create an instance of this fragment.
 */
class SplashScreenFragment : Fragment() {

    var sharedPreferences: SharedPreferences? = null;

    private var _binding: FragmentSplashBinding? = null
    private val binding get() = _binding!!


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        arguments?.let {
        }
    }



    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        // Inflate the layout for this fragment
        _binding = FragmentSplashBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btnStart = binding.btnStart

        btnStart.setOnClickListener{
            view.findNavController().navigate(R.id.action_nav_splashscreen_to_nav_login)
        }
    }

}