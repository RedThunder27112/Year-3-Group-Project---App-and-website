package com.example.lambdapp_androidapp_d2.ui.registration

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.annotation.StringRes
import androidx.lifecycle.Observer
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.MainActivity
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentRegistrationBinding
import com.example.lambdapp_androidapp_d2.ui.login.LoggedInUserView

class RegistrationFragment : Fragment() {

    /*companion object {
        fun newInstance() = RegistrationFragment()
    }*/

    private lateinit var viewModel: RegistrationViewModel
    private var _binding: FragmentRegistrationBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegistrationBinding.inflate(inflater, container, false)
        return binding.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this, RegisterViewModelFactory())[RegistrationViewModel::class.java]

        viewModel.owner = this

        val switchToLogin = binding.switchtologin
        val usernameEditText = binding.username2
        val passwordEditText = binding.password2
        val nameEditText = binding.name
        val surEditText = binding.surname
        val codeEditText = binding.edtcode
        val registrationButton = binding.register
        val loadingProgressBar = binding.loading2


        MainActivity.updateMenu(false)

        viewModel.registerFormState.observe(viewLifecycleOwner,
            Observer { registerFormState ->
                if (registerFormState == null) {
                    return@Observer
                }
                registrationButton.isEnabled = registerFormState.isDataValid
                registerFormState.usernameError?.let {
                    usernameEditText.error = getString(it)
                }
                registerFormState.passwordError?.let {
                    passwordEditText.error = getString(it)
                }
                registerFormState.nameError?.let {
                    nameEditText.error = getString(it)
                }
                registerFormState.surnameError?.let {
                    surEditText.error = getString(it)
                }
            })

        //OBSERVES WHETHER REGISTRATION WAS SUCCESSFUL OR NOT
        viewModel.registerResult.observe(viewLifecycleOwner,
            Observer { registerResult ->
                registerResult ?: return@Observer
                loadingProgressBar.visibility = View.GONE
                registerResult.error?.let {
                    showRegisterFailed(it)
                }
                registerResult.success?.let {
                    updateUiWithUser(it)
                    //IF LOGIN SUCCEEDED, NAVIGATE TO HOME
                    view.findNavController().navigate(R.id.action_nav_registration_to_nav_home)
                }
            })

        val afterTextChangedListener = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
                // ignore
            }

            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                // ignore
            }

            override fun afterTextChanged(s: Editable) {
                viewModel.registerDataChanged(
                    usernameEditText.text.toString(),
                    passwordEditText.text.toString(),
                    nameEditText.text.toString(),
                    surEditText.text.toString()
                )
            }
        }
        usernameEditText.addTextChangedListener(afterTextChangedListener)
        passwordEditText.addTextChangedListener(afterTextChangedListener)
        nameEditText.addTextChangedListener(afterTextChangedListener)
        surEditText.addTextChangedListener(afterTextChangedListener)
        codeEditText.addTextChangedListener(afterTextChangedListener)
        codeEditText.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                viewModel.register(
                    usernameEditText.text.toString(),
                    passwordEditText.text.toString(),
                    nameEditText.text.toString(),
                    surEditText.text.toString(),
                    codeEditText.text.toString()
                )
            }
            false
        }

        registrationButton.setOnClickListener {
            loadingProgressBar.visibility = View.VISIBLE
            viewModel.register(
                usernameEditText.text.toString(),
                passwordEditText.text.toString(),
                nameEditText.text.toString(),
                surEditText.text.toString(),
                codeEditText.text.toString()
            )

        }


        //switch to the login page button
        switchToLogin.setOnClickListener{
            view.findNavController().navigate(R.id.action_nav_registration_to_nav_login)
        }
    }

    private fun updateUiWithUser(model: LoggedInUserView) {
        (requireActivity() as MainActivity).displayAdminStuffIfAdmin()
        val welcome = getString(R.string.welcome) + model.displayName
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, welcome, Toast.LENGTH_LONG).show()
    }

    private fun showRegisterFailed(@StringRes errorString: Int) {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, errorString, Toast.LENGTH_LONG).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

}