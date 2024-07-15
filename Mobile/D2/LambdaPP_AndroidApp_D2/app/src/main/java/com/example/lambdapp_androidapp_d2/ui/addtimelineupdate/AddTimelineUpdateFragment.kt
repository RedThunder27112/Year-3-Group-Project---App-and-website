package com.example.lambdapp_androidapp_d2.ui.addtimelineupdate

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity.RESULT_OK
import android.content.Context
import android.content.Intent
import android.content.IntentSender.SendIntentException
import android.content.pm.PackageManager
import android.database.Cursor
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.os.Bundle
import android.os.Looper
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.widget.SwitchCompat
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentAddTimelineUpdateBinding
import com.example.lambdapp_androidapp_d2.models.Employee
import com.example.lambdapp_androidapp_d2.models.Notification
import com.example.lambdapp_androidapp_d2.models.Skill
import com.example.lambdapp_androidapp_d2.models.Task_Request
import com.example.lambdapp_androidapp_d2.models.Task_Status
import com.example.lambdapp_androidapp_d2.models.Task_Update
import com.example.lambdapp_androidapp_d2.ui.taskDetails.TaskDetailsViewModel
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import com.google.android.gms.tasks.Task
import okhttp3.MediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import kotlin.properties.Delegates


class AddTimelineUpdateFragment : Fragment() {
    private var _binding: FragmentAddTimelineUpdateBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private lateinit var viewModel: addTimelineUpdateViewModel
    //ui components
    private lateinit var rbLocation: SwitchCompat
    private lateinit var txtDescription: EditText
    private lateinit var radiogroupStatuses: RadioGroup
    private lateinit var btnAddPicture: Button
    private lateinit var btnAddTimelineUpdate: Button
    private lateinit var radioList: ArrayList<RadioButton>

    //notification variables - Delegates.notNull is equivalent to lateinit for basic datatypes like Int
    private var completeID : Int? = null
    private var lastID by Delegates.notNull<Int>()

    //Location variables
    private lateinit var userLocation: Location
    private lateinit var locationRequest: LocationRequest
    private val LOCATION_PERMISSION_REQUEST_CODE = 1

    //Image variables
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

        _binding = FragmentAddTimelineUpdateBinding.inflate(inflater, container, false)

        btnAddTimelineUpdate = binding.btnAddTimelineUpdate
        btnAddPicture = binding.btnAddPicture

        rbLocation = binding.rbLocation
        txtDescription = binding.txtDescription
        radiogroupStatuses = binding.radioGroup

        val loadingProgressBar = binding.progressBar
        loadingProgressBar.visibility = View.GONE
        btnAddTimelineUpdate.isEnabled = false

        viewModel = ViewModelProvider(requireActivity())[addTimelineUpdateViewModel::class.java]
        val taskID = ViewModelProvider(requireActivity())[TaskDetailsViewModel::class.java].getTaskID()
        val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1

        val conManager = ApiConnectionManager()

        conManager.getTaskSupervisor( taskID, object : retrofit2.Callback<Employee> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Employee>,
                response: Response<Employee>
            ) {
                var emp : Employee? = null
                //check if the response was successful
                if (response.isSuccessful) {
                    if(response.body() != null)
                        emp = response.body()!!
                }

                var isSupervisor = false
                if(emp != null)
                {
                    if(userID == emp.emp_ID)
                        isSupervisor = true
                    //I'm guessing this was just for testing purposes? kind of a vulnurability and doesn't make sense
                    //so commenting it out
                    /*if(emp.emp_ID == 0)
                    {
                        isSupervisor = true
                    }*/
                    Log.i("ayyayayayaya",emp.emp_ID.toString())
                }else
                {
                    isSupervisor = true // if no supervisor exists, display
                    Log.i("ayyayayayaya","was else")
                }


                //get statuses
                conManager.getStatuses(object : retrofit2.Callback<List<Task_Status>> {
                    //here we receive a response. Not necessarily successful - could be 404 for example
                    override fun onResponse(
                        call: Call<List<Task_Status>>,
                        response: Response<List<Task_Status>>
                    ) {
                        //check if the response was successful
                        if (response.isSuccessful) {
                            //exclude certain statuses from being displayed
                            val listOfExcludedStatuses = arrayOf("AWAITING REVIEW","RESOURCES REQUESTED","RESOURCES ALLOCATED","RESOURCES DENIED","EXTENSION APPROVED","EXTENSION DENIED","REMOVAL APPROVED","REMOVAL DENIED")
                            radioList = ArrayList();
                            for (s: Task_Status in response.body()!!)
                            {
                                if (s.status_Name !in listOfExcludedStatuses)
                                {
                                    if(!s.status_Name.contains("COMPLETE"))
                                        createRadioButton(s)
                                    else if(isSupervisor)
                                        createRadioButton(s)
                                }
                            }
                        } else {
                            Log.e("statuses","Get Status failed!")
                        }
                    }

                    //failure - an exception t was encountered
                    override fun onFailure(call: Call<List<Task_Status>>, t: Throwable) {
                        t.printStackTrace()
                    }
                })
            }
            //failure - an exception t was encountered
            override fun onFailure(call: Call<Employee>, t: Throwable) {

            }
        })

        val task = viewModel.createTask(taskID)

        btnAddTimelineUpdate.isEnabled = true
        btnAddTimelineUpdate.setOnClickListener {
            loadingProgressBar.visibility = View.VISIBLE
            //post update
            val update = createTaskUpdate(taskID, userID)

            if (radiogroupStatuses.checkedRadioButtonId != -1)
            {
                for(r : RadioButton in radioList)
                {
                    if(r.id == radiogroupStatuses.checkedRadioButtonId)
                    {
                        if(r.text.contains("EXTENSION"))
                        {
                            Log.i("both","extend");
                            postRequest2(taskID, 1,conManager)
                        }else
                            if(r.text.contains("REMOVAL"))
                            {
                                Log.i("both","rmove");
                                postRequest2(taskID, 0,conManager)
                            }

                    }
                }
            }




            if(update.update_Description == "Task extension has been requested." || update.update_Description == "Employee removal has been requested.")
            {
                goBack()
                //makes sure 2 updates dont occur
            }else
            {
                conManager.postUpdate(update, object : retrofit2.Callback<Task_Update> {
                    //here we receive a response. Not necessarily successful - could be 404 for example
                    override fun onResponse(
                        call: Call<Task_Update>,
                        response: Response<Task_Update>
                    ) {
                        loadingProgressBar.visibility = View.GONE
                        //check if the response was successful
                        Log.i("tagggg","1")
                        if (response.isSuccessful && response.body() != null) {
                            //if the task update said the task is complete, notify the team
                            Log.i("tagggg","2")
                            if (update.updated_Status_ID == completeID)
                            {
                                Log.i("tagggg","3")
                                task.observe(viewLifecycleOwner) { observedTask ->
                                    Log.i("tagggg","4")
                                    if (observedTask != null)
                                    {
                                        Log.i("tagggg","5")
                                        sendNotification(observedTask)
                                    }

                                }
                            }
                            //if there was an image, send it
                            if (imagePath != null && canSendImages)
                            {
                                //update.update_Image = update_ImageTemp2.update_Image
                                sendImage(imagePath, response.body()!!.update_ID)
                            }
                            goBack()
                        } else {
                            val appContext = context?.applicationContext ?: return
                            Toast.makeText(appContext, "Error posting update", Toast.LENGTH_LONG)
                                .show()
                        }
                    }


                    //failure - an exception t was encountered
                    override fun onFailure(call: Call<Task_Update>, t: Throwable) {
                        loadingProgressBar.visibility = View.GONE
                        val appContext = context?.applicationContext ?: return
                        Toast.makeText(appContext, "Error: " + t.message, Toast.LENGTH_LONG).show()
                    }
                })
            }



        }

        btnAddPicture.setOnClickListener {
            requestFileAccessPermissions()
        }

        //handle location adding
        rbLocation.setOnCheckedChangeListener { _: CompoundButton, b: Boolean ->
            //see if location is enabled
            if (b)
                getLocation()
        }

        return binding.root
    }

    private fun requestFileAccessPermissions() {
        Log.d("requestFileAccessPermissions","Checking if permissions are granted...")
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            // We don't have the permissions, so request them
            Log.d("requestFileAccessPermissions","Don't have permissions so requesting them")

            val permissions  = arrayOf( Manifest.permission.READ_EXTERNAL_STORAGE)
            ActivityCompat.requestPermissions(requireActivity(),permissions,FILE_PERMISSION_REQUEST_CODE)
            Log.d("requestFileAccessPermissions","Permissions requested, awaiting callback...")
            //from here the result is handled by onRequestPermissionResult
            ActivityCompat.OnRequestPermissionsResultCallback { i: Int, strings: Array<String?>, ints: IntArray ->
                handleRequestPermissionsResult(i,strings,ints)
            }
        } else {
            // Permissions are already granted, handle the image selection
            Log.d("requestFileAccessPermissions","Have permissions")
            openImgPicker()
        }
    }

    private fun openImgPicker() {
        Log.d("requestFileAccessPermissions","Opening Image Picker")
        canSendImages = true
        val gallery = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.INTERNAL_CONTENT_URI)
        startActivityForResult(gallery, pickImage)
    }

    private fun getLocation() {
        btnAddTimelineUpdate.isEnabled = false
        Log.d("location","trying to get location")
        //val locationManager = this.requireContext().getSystemService(Context.LOCATION_SERVICE) as LocationManager
        if (ActivityCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            Log.d("location","has permission")
            locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY,5000).build()
            //locationRequest = LocationRequest().setPriority(Priority.PRIORITY_HIGH_ACCURACY).setInterval(5000)

            if (isGPSEnabled() && checkGooglePlayServices()) {
                Log.d("location","gps is enabled and has google play services")
                val fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this.requireContext())

                val locationCallback = object : LocationCallback() {
                    override fun onLocationResult(locationResult: LocationResult) {
                        //super.onLocationResult(locationResult)
                        val locationactivity = this@AddTimelineUpdateFragment.activity
                        if (locationactivity != null)
                            LocationServices.getFusedLocationProviderClient(locationactivity).removeLocationUpdates(this)
                        else
                        {
                            val locationcontext = this@AddTimelineUpdateFragment.context
                            if (locationcontext != null)
                                LocationServices.getFusedLocationProviderClient(locationcontext).removeLocationUpdates(this)
                            else
                            {
                                Log.e("location","neither activity or context found!")
                                disableLocation()
                                return
                            }
                        }

                        if (locationResult.locations.isNotEmpty()) {
                            val lastLoc = locationResult.locations.last()
                            useLocation(lastLoc)
                        }
                        else
                        {
                            Log.d("location","no location found")
                            Toast.makeText(requireContext(),"No location found!", Toast.LENGTH_LONG).show()
                            disableLocation()
                        }
                    }
                }

                fusedLocationProviderClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper())
                    .addOnFailureListener(this.requireActivity()) { e ->
                        run {
                            Toast.makeText(requireContext(), e.stackTraceToString(), Toast.LENGTH_LONG).show()
                            Log.d("location","failure when trying to request location updates")
                            e.printStackTrace()
                            disableLocation()
                        }
                    }

                /*fusedLocationProviderClient.lastLocation
                    .addOnSuccessListener { loc -> // GPS location can be null if GPS is switched off
                        loc?.let { useLocation(it) }
                    }
                    .addOnFailureListener { e ->
                        e.printStackTrace()
                        disableLocation()
                    }*/
            } else if (!isGPSEnabled()) {
                Log.d("location","gps is not enabled")
                turnOnGPS()
            }
            else
            {
                Log.d("location","no google play services!")
                disableLocation()
            }
        }
        else
        {
            //permission not granted for fine.
            //check permission for course?
            /*&& ActivityCompat.checkSelfPermission(
               this.requireContext(),
               android.Manifest.permission.ACCESS_COARSE_LOCATION
           ) != PackageManager.PERMISSION_GRANTED*/

            Log.d("location","no location permission, requesting permission:")
            // requesting the missing permissions, and then overriding onRequestPermissionsResult

            binding.progressBar.visibility = View.VISIBLE
            val permissions  = arrayOf( Manifest.permission.ACCESS_FINE_LOCATION)
            ActivityCompat.requestPermissions(requireActivity(),permissions,LOCATION_PERMISSION_REQUEST_CODE)
            ActivityCompat.OnRequestPermissionsResultCallback { i: Int, strings: Array<String?>, ints: IntArray ->
                handleRequestPermissionsResult(i,strings,ints)
            }
            //disable location. listening for when the permission is enabled doesn't seem to want to work, so just have the user press the switch again
            //very sad solution but for now it's okay
            disableLocation()

        }

        //tried another library, an external one. It's outdated though, doesn't work with Androidx. Leaving it here in case
        /*SmartLocation.with(requireContext()).location().oneFix().start {
            Toast.makeText(
                requireContext(),
                "Latitude: $it.latitude\nLongitude: $it.longitude",
                Toast.LENGTH_LONG
            ).show()
        }*/
    }

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
    }
    private fun useLocation(lastLoc: Location) {
        //Toast.makeText(requireContext(), "Latitude: $lastLoc.latitude\nLongitude: $lastLoc.longitude", Toast.LENGTH_LONG).show()
        Log.d("location","Latitude: $lastLoc.latitude\nLongitude: $lastLoc.longitude")
        userLocation = lastLoc
        btnAddTimelineUpdate.isEnabled = true
    }

    private fun turnOnGPS() {
        Log.d("location","trying to request turn on gps")
        val builder = LocationSettingsRequest.Builder().addLocationRequest(locationRequest)
        builder.setAlwaysShow(true)
        val result: Task<LocationSettingsResponse> =
            //assuming here we want this.requireactivity. Maybe we want context
            LocationServices.getSettingsClient(this.requireActivity())
                .checkLocationSettings(builder.build())
        result.addOnCompleteListener { task ->
            try {
                task.getResult(ApiException::class.java)
                Toast.makeText(context, "GPS is already turned on", Toast.LENGTH_SHORT)
                    .show()
            } catch (e: ApiException) {
                when (e.statusCode) {
                    LocationSettingsStatusCodes.RESOLUTION_REQUIRED -> try {
                        val resolvableApiException = e as ResolvableApiException
                        resolvableApiException.startResolutionForResult(this.requireActivity(), 2)
                    } catch (ex: SendIntentException) {
                        ex.printStackTrace()
                    }
                    LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE -> {}
                }
            }
        }
    }
    private fun isGPSEnabled(): Boolean {
        val locationManager =
            this.requireContext().getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
    }

    // handle where the user grants or rejects the location permission

    fun handleRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String?>,
        grantResults: IntArray
    ) {
        binding.progressBar.visibility = View.GONE
        Log.d("RequestPermissions","Request Permission result received")
        //location management
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("RequestPermissions","Location access granted")
                if (isGPSEnabled()) {
                    Log.d("RequestPermissions","GPS is enabled, getting location")
                    getLocation()
                } else {
                    Log.d("RequestPermissions","GPS not enabled, enabling")
                    turnOnGPS()
                    getLocation()
                }
            }
            else
            {
                Log.d("RequestPermissions","Location Access not granted")
                Toast.makeText(context, "Location access not granted", Toast.LENGTH_SHORT)
                    .show()
                disableLocation()
            }
        } //image sending management
        else if (requestCode == FILE_PERMISSION_REQUEST_CODE) {
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

    private fun disableLocation() {
        rbLocation.isChecked = false
        btnAddTimelineUpdate.isEnabled = true
    }

    private fun goBack() {
        //val result2 = Bundle()
        //result2.putInt("taskID", taskID)
        //parentFragmentManager.setFragmentResult("selectedTask", result2)
        binding.root.findNavController().popBackStack()
        //binding.root.findNavController().navigate(R.id.action_nav_addTimelineUpdate_to_nav_taskDetailsParent)
    }
    private fun createRadioButton(s: Task_Status) {
        val rb = RadioButton(this.requireContext())
        rb.text = s.status_Name
        rb.id = s.status_ID
        radiogroupStatuses.addView(rb)

        radioList.add(rb);
        if(s.status_Name.contains("COMPLETED"))
        {
            completeID = s.status_ID
        }
    }

    @SuppressLint("SimpleDateFormat")
    private fun sendNotification(task : com.example.lambdapp_androidapp_d2.models.Task): Notification {
        val notification = Notification()
        val empID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
        notification.task_ID = task.task_ID
        notification.emp_ID = empID
        notification.not_Description = task.task_Name +" Task Completed: Please Provide Feedback and a Rating"
        notification.not_Date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(GregorianCalendar.getInstance().time)
        notification.not_Viewed = false

        val conManager = ApiConnectionManager()
        //get statuses
        conManager.postNotification(notification, object : retrofit2.Callback<Notification> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Notification>,
                response: Response<Notification>
            ) {
                //check if the response was successful
                if (response.isSuccessful) {
                    Log.d("location","successful notification sent")
                } else {
                    Log.d("location","no notification sent")
                }
            }

            //failure - an exception t was encountered
            override fun onFailure(call: Call<Notification>, t: Throwable) {
                t.printStackTrace()
            }
        })
        return notification
    }

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
            conManager.postUpdatePicx(body,taskUpdateID, object : retrofit2.Callback<ResponseBody> {
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

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        //handles the image picker
        if (resultCode == RESULT_OK && requestCode == pickImage && data != null) {
            imageUri = data.data!!
            imagePath = getPathFromUri(requireContext(),imageUri)
            if (imagePath != null)
                btnAddPicture.text = getString(R.string.change_image)
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

    @SuppressLint("SimpleDateFormat")
    private fun createTaskUpdate(taskId: Int, userID: Int): Task_Update {
        val update = Task_Update()
        update.task_ID = taskId
        update.emp_ID = userID
        update.update_Enabled = true
        update.update_Time =
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(GregorianCalendar.getInstance().time)

        if (rbLocation.isChecked)
        {
            if (::userLocation.isInitialized)
                update.update_Location = "POINT(${userLocation.latitude} ${userLocation.longitude})"
            else
            {
                Toast.makeText(requireContext(), "Cannot add location! No coordinates found!", Toast.LENGTH_SHORT).show()
            }
        }
        lastID = update.update_ID



        update.update_Description = txtDescription.text.toString()


        //this is for default comments if none made by user
        if (radiogroupStatuses.checkedRadioButtonId != -1)
        {
            for(r : RadioButton in radioList)
            {
                if(r.id == radiogroupStatuses.checkedRadioButtonId)
                {
                    if(r.text.contains("EXTENSION") && update.update_Description.equals(""))
                    {
                        update.update_Description = "Task extension has been requested."

                    }else
                        if(r.text.contains("REMOVAL")  && update.update_Description.equals(""))
                        {
                            update.update_Description = "Employee removal has been requested."
                        }else
                            if(r.text.contains("COMPLETE")  && update.update_Description.equals(""))
                            {
                                update.update_Description = "Task has been completed."
                            }else
                                if(update.update_Description.equals(""))
                                {
                                    update.update_Description = r.text.toString()
                                }

                }
            }
        }


        if (radiogroupStatuses.checkedRadioButtonId != -1)
            update.updated_Status_ID = radiogroupStatuses.checkedRadioButtonId

        return update
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
    }*/
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
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

    fun  postRequest2(taskID : Int, toggle : Int, connectionManager: ApiConnectionManager)
    {
        Log.i("logTaskSend","0")
        //post the request to the api
        val request = Task_Request()

        request.task_ID = taskID
        val empID = LoginRepository.getInstance()?.user?.userId ?: -1

        var requestDescr = "removal"

        if (toggle==0)
        {
            request.req_Type = "removal"
            requestDescr = "Removal request for task " + request.task_ID + ", employee "+empID+":\n"
        }
        else if (toggle==1)
        {
            request.req_Type = "extension"
            requestDescr = "Request extension for task " + request.task_ID + ":\n"
        }

        request.req_Approval = 0
        val inputFormat = android.icu.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH)
        val outputFormat = android.icu.text.SimpleDateFormat("MM/dd ha", Locale.ENGLISH)

        request.req_Date = "2023-08-08"
        request.req_Request = "1 1"
        request.req_Description =requestDescr
        request.emp_ID = empID
        Log.i("logTaskSend empID",request.emp_ID.toString())
        Log.i("logTaskSend taskID",request.toString())
        //create the connection manager

        Log.i("logTaskSend","01")
        connectionManager.postRequest(request, object : retrofit2.Callback<Task_Request> {
            //here we receive a response. Not necessarily successful - could be 404 for example
            override fun onResponse(
                call: Call<Task_Request>,
                response: Response<Task_Request>
            ) {

                //check if the response was successful
                if (response.isSuccessful) {
                    Log.i("logTaskSend","1")

                } else {
                    val appContext = context?.applicationContext ?: return
                    Toast.makeText(appContext, "Error posting update", Toast.LENGTH_LONG)
                        .show()
                    Log.i("logTaskSend","2")
                }
            }


            //failure - an exception t was encountered
            override fun onFailure(call: Call<Task_Request>, t: Throwable) {
                val appContext = context?.applicationContext ?: return
                Toast.makeText(appContext, "Error: " + t.message, Toast.LENGTH_LONG).show()
                Log.i("logTaskSend","3")
            }
        })
    }



override fun onResume() {
        super.onResume()
        viewModel = ViewModelProvider(requireActivity())[addTimelineUpdateViewModel::class.java]
        viewModel.refreshTask()
    }




}