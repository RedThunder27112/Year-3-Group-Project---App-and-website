package com.example.lambdapp_androidapp_d2.ui.updateUserDetails

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentUpdateProfileBinding
import com.example.lambdapp_androidapp_d2.models.Employee
import okhttp3.MediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import java.io.File

/**
 * A simple [Fragment] subclass.
 * Use the UpdateProfile.newInstance factory method to
 * create an instance of this fragment.
 */
class UpdateProfile : Fragment() {

    private var _binding: FragmentUpdateProfileBinding? = null
    private lateinit var viewModel: updateprofileViewModel
    var employeeID: Int = 0

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private lateinit var btnUploadProfile: Button

    private val pickImage = 100
    private val FILE_PERMISSION_REQUEST_CODE = 123
    private lateinit var imageUri: Uri
    private var imagePath: String? = null
    private var canSendImages = true

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        viewModel = ViewModelProvider(requireActivity())[updateprofileViewModel::class.java]



        _binding = FragmentUpdateProfileBinding.inflate(inflater, container, false)

        val txtUsername = binding.txtUsername
        //val txtUsername2 = binding.txtUsername2//confirmation username
        val txtName = binding.txtName
        val txtSurname = binding.txtSurname
        val txtPassword = binding.txtPassword
        val txtPassword2 = binding.txtPassword2//confirmation password
        val btnUpdate = binding.btnUpdateDetails

        val imgProfilePic = binding.imgUser

        //display profile pic
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        ApiConnectionManager.loadProfilePic(this.requireContext(),userID, imgProfilePic)

        //val textView: TextView = binding.textGallery
        viewModel.employee.observe(viewLifecycleOwner) {
            if (it != null)
            {
                employeeID = userID
                txtUsername.setText(it.emp_Username)
                txtName.setText(it.emp_Name)
                txtSurname.setText(it.emp_Sur)

                //api functionality needed: Get avg rating, get count of completed tasks, get count supervised tasks

                //loading image:
                ApiConnectionManager.loadProfilePic(this.requireContext(),it.emp_ID, imgProfilePic)
            }
        }

        btnUpdate.setOnClickListener {

            //showLoginFailed(0)
            if(txtPassword.text.toString() != txtPassword2.text.toString())
            {
                errorPassword()
            }else
            {
                if(txtPassword.text.toString().length in 1..5)
                {
                    errorPasswordLength()
                }else
                {
                    successMessage()
                    updateDetails(txtUsername.text.toString(), txtName.text.toString(), txtSurname.text.toString(), txtPassword.text.toString())

                    Log.i("success maybe", "sucess")
                    //viewModel.updateDetails(viewModel.getUpdate())
                }

            }

            if (imagePath != null && canSendImages)
            {
                val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
                sendImage(imagePath, userID)
            }

            viewModel.refreshTask()


        }


        btnUploadProfile = binding.btnUploadProfile

        btnUploadProfile.setOnClickListener()
        {
            Log.i("picFIx","1")
            requestFileAccessPermissions()

        }

        return binding.root

    }

    private fun errorPassword()
    {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, "Error: The Passwords Do Not Match", Toast.LENGTH_LONG)
            .show()
    }

    private fun errorPasswordLength()
    {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, "Error: The Minimum Password Length is 6 ", Toast.LENGTH_LONG)
            .show()
    }

    private fun successMessage()
    {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, "Details Successfully Updated", Toast.LENGTH_LONG)
            .show()
    }

    private fun updateDetails(username: String, name: String, surname: String, password: String){

        val employee = MutableLiveData<Employee>().apply {
            val employee = Employee()
            employee.emp_ID = employeeID
            employee.emp_Username = username
            employee.emp_Name = name
            employee.emp_Sur = surname
            employee.emp_Password = password

            val conManager = ApiConnectionManager()
            //get statuses

            conManager.postDetailsUpdate(employee, object : retrofit2.Callback<Employee> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Employee>,
                    response: Response<Employee>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        Log.i("success maybe", "successfully posted details update")
                        binding.root.findNavController().popBackStack()
                    } else {
                        Log.i("success maybe", "failure to post details update")
                        showLoginFailed("Error posting details.")
                    }
                }

                //failure - an exception t was encountered
                override fun onFailure(call: Call<Employee>, t: Throwable) {
                    showLoginFailed("Error connecting to server")
                }
            })
        }

    }

    private fun showLoginFailed(errorString: String) {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, errorString, Toast.LENGTH_LONG).show()
    }
    /*override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val afterTextChangedListener = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
                // ignore
            }
            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                // ignore
            }
            override fun afterTextChanged(s: Editable) {
            }
        }
    }
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }*/


    private fun requestFileAccessPermissions() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            // We don't have the permissions, so request them
            Log.i("picFIx","2")
            ActivityCompat.requestPermissions(
                requireActivity(),
                arrayOf(
                    Manifest.permission.READ_EXTERNAL_STORAGE
                ),
                FILE_PERMISSION_REQUEST_CODE
            )
            Log.i("picFIx","4")
            //from here the result is handled by onRequestPermissionResult
            ActivityCompat.OnRequestPermissionsResultCallback { i: Int, strings: Array<String?>, ints: IntArray ->

                handleRequestPermissionsResult(i,strings,ints)

            }
        } else {
            // Permissions are already granted, handle the image selection
            Log.i("picFIx","3")

            openImgPicker()


        }
    }

    private fun openImgPicker() {
        canSendImages = true
        val gallery = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.INTERNAL_CONTENT_URI)
        startActivityForResult(gallery, pickImage)
    }
    /*
        private fun checkGooglePlayServices(): Boolean {
            val checkGooglePlayServices = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(requireContext())
            //return code could be SUCCESS, SERVICE_MISSING, SERVICE_VERSION_UPDATE_REQUIRED, SERVICE_DISABLED, SERVICE_INVALID
            if (checkGooglePlayServices != ConnectionResult.SUCCESS) {
                //Google Play Services is missing/update required. Show the specific error dialogue for the error
                GoogleApiAvailability.getInstance().getErrorDialog(
                    this,
                    checkGooglePlayServices,
                    200
                )!!.show()
                return false
            }
            return true
        }*/
    private fun sendImage(filePath: String?, taskUpdateID: Int) {
        Log.i("success maybe","connection made?")

        //val imageUri = "drawable://" + R.drawable.team
        //val file = File()
        /*val path = Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_PICTURES
        )
        path.mkdirs()

        val fileName = File(uri.path).name
        val file = File(path, fileName)

        Log.i("path name",uri.getPath().toString())
        Log.i("file name",fileName)
        Log.i("string name",uri.toString())
        //val file = File(uri.getPath())
        //val file = File(imageUri)*/

        if (filePath != null)
        {
            //val file = File(Environment.getExternalStorageDirectory().path + "/Pictures/" + filePath.fileName.toString())
            val file = File(filePath)
            //val file = requireContext().contentResolver.openInputStream(uri) ?: return
            val fbody = RequestBody.create(
                MediaType.parse("image/*"),
                file
            )
            //val fbody = file.asRequestBody("image/*".toMediaTypeOrNull())
            //note: the name - "file" in this case - has to match the name the api is expecting!
            val body = MultipartBody.Part.createFormData("file", file.name, fbody)

            //val ItemId = RequestBody.create(MultipartBody.FORM, "22")
            //val ImageNumber = RequestBody.create(MultipartBody.FORM, "1")

            val conManager = ApiConnectionManager()
            //get statuses
            conManager.postProfilePic(body,taskUpdateID, object : retrofit2.Callback<ResponseBody> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<ResponseBody>,
                    response: Response<ResponseBody>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        Log.i("success maybe","sucess")
                    } else {
                        Log.i("success maybe","failurrrr")
                    }
                }

                //failure - an exception t was encountered
                override fun onFailure(call: Call<ResponseBody>, t: Throwable)
                {
                    Log.i("failure msg",t.message.toString())
                    t.printStackTrace()
                }
            })
        }
        else
        {
            Toast.makeText(requireContext(), "Error posting image", Toast.LENGTH_LONG)
                .show()
        }

    }

    fun handleRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String?>,
        grantResults: IntArray
    ) {

        Log.d("RequestPermissions","Request Permission result received")
//image sending management
        if (requestCode == FILE_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, handle the image selection
                openImgPicker()
            } else {
                // Permission denied, show an error message
                Toast.makeText(context, "File access not granted, can't send images", Toast.LENGTH_SHORT)
                    .show()
                canSendImages = false
            }
        }
        else
        {
            Log.d("RequestPermissions","Unexpected request code $requestCode received")
        }

    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        //handles the image picker
        if (resultCode == Activity.RESULT_OK && requestCode == pickImage && data != null) {
            imageUri = data.data!!
            imagePath = getPathFromUri(requireContext(),imageUri)
            if (imagePath != null)
                btnUploadProfile.text = getString(R.string.change_image)
            else
                Toast.makeText(requireContext(), "error processing file path", Toast.LENGTH_SHORT).show()
            //imageView.setImageURI(imageUri)
            //update_ImageTemp2 = Task_Update()
            //update_ImageTemp2.update_Image = imageUri.let { context?.contentResolver?.openInputStream(it)?.use { it.buffered().readBytes() } }
        }
            else
            {
                Toast.makeText(requireContext(), "Unexpected activity result", Toast.LENGTH_SHORT).show()

                Log.d("location","Unexpected activity result: requestCode: $requestCode resultCode: $resultCode")
                if (data != null) Log.d("location",data.toString())
            }
    }

    private fun getPathFromUri(context: Context, uri: Uri): String? {
        //converts the uri into a path, seems to work with the emulator. Not sure how it'll work with an actual phone, hopefully should still work!

        //check if the uri's path is already valid
        if (uri.scheme == "file")
            return uri.path

        var path: String? = null
        if (uri.scheme == "content")
        {
            val projection = arrayOf(MediaStore.Images.Media.DATA)
            try
            {
                //places a "cursor" at the correct spot in the data folder, converting from the URI's weird value
                val cursor: Cursor? = context.contentResolver.query(uri, projection, null, null, null)
                cursor?.use {
                    if (it.moveToFirst()) {
                        val columnIndex = it.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
                        path = it.getString(columnIndex)
                    }
                }
                return path
            }
            catch (exception: Exception)
            {
                exception.printStackTrace()
                return null

            }
        }
        else
        {
            Log.d("location","Unexpected uri scheme: $uri.scheme")
            return null
        }

    }
}