package com.example.lambdapp_androidapp_d2.ui.calendar

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class CalendarViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "My Schedule"
    }
    val text: LiveData<String> = _text
}