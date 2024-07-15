package com.example.lambdapp_androidapp_d2.ui.updateUserDetails

import android.Manifest

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.RadioGroup
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModelProvider
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.data.LoginRepository
import com.example.lambdapp_androidapp_d2.databinding.FragmentUpdateProfileRatingBinding
import com.example.lambdapp_androidapp_d2.models.Employee_Skill_Bridge
import com.example.lambdapp_androidapp_d2.models.Skill
import com.example.lambdapp_androidapp_d2.R
import okhttp3.MediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import java.io.File


class UpdateProfileRatingFragment : Fragment() {



    private var _binding: FragmentUpdateProfileRatingBinding? = null
    private lateinit var radiogroupLevels: RadioGroup
    private lateinit var viewModel: updateprofileViewModel
    private lateinit var listAllSkills: ArrayList<Skill>
    private lateinit var btnUploadDoc: Button
    private lateinit var spinnerListSkills : Spinner
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    //Image variables
    private val pickImage = 111
    private val FILE_PERMISSION_REQUEST_CODE = 123
    private lateinit var imageUri: Uri
    private var imagePath: String? = null
    private var canSendImages = true

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUpdateProfileRatingBinding.inflate(inflater, container, false)
        viewModel = ViewModelProvider(requireActivity())[updateprofileViewModel::class.java]

        val SkillLayout = binding.SkillLayout
        val btnPostUpdateDoc = binding.btnPostUpdateDoc

        spinnerListSkills = binding.spinnerListSkills
        radiogroupLevels = binding.levelGroup
        val listSkills = getSkills()
/*
        listSkills.observe(viewLifecycleOwner) { observedSkill ->
            if (observedSkill != null) {
                listSkills.observe(viewLifecycleOwner)
                {
                    if (it != null) {
                        if (it.isEmpty())
                            Toast.makeText(requireContext(),"No skills found",Toast.LENGTH_LONG).show()
                        else {
                            listCheckbox = ArrayList()
                            for (t: Skill in it)
                                addCheckBox(t, SkillLayout)
                        }

                        viewModel.skill.observe(viewLifecycleOwner) { skills ->
                            Log.i("skillsx","1x")
                            if (skills != null) {
                                if (skills.isEmpty())
                                    Log.i("skillsx","2")
                                else
                                {
                                    Log.i("skillsx","sss")
                                    for (d: Skill in skills)
                                        addCheckBox(d, SkillLayout)
                                }

                            }
                        }
                    }
                }
            }
        }*/

        viewModel.skill.observe(viewLifecycleOwner) {
            Log.i("skillsx","1x")
            if (it != null) {
                if (it.isEmpty())
                    Log.i("skillsx","2")
                else
                {
                    SkillLayout.removeAllViews();

                    Log.i("skillsx","sss")
                    listAllSkills = ArrayList<Skill>()
                    for (t: Skill in it)
                        addTextView(t, SkillLayout)
                }

                listSkills.observe(viewLifecycleOwner) { observedSkill ->
                    if (observedSkill != null) {
                        listSkills.observe(viewLifecycleOwner)
                        {

                            if (it != null) {
                                if (it.isEmpty())
                                    Toast.makeText(requireContext(),"No skills found",Toast.LENGTH_LONG).show()
                                else {
                                    addSpinner(it, SkillLayout, this.requireContext())
                                }

                            }
                        }
                    }
                }

            }
        }

        btnPostUpdateDoc.setOnClickListener()
        {
            var selectedSkill = getSelectedSkill()
            Log.i("testSkillID", selectedSkill.skill_ID.toString())
            if(selectedSkill.skill_ID >= 0)
            {

                var skillLevel = 0
                if (radiogroupLevels.checkedRadioButtonId != -1)//checking if radio button is clicked
                {
                    if(R.id.radioButton == radiogroupLevels.checkedRadioButtonId)
                    {
                        skillLevel = 1
                    }
                    if(R.id.radioButton2 == radiogroupLevels.checkedRadioButtonId)
                    {
                        skillLevel = 2
                    }
                    if(R.id.radioButton3 == radiogroupLevels.checkedRadioButtonId)
                    {
                        skillLevel = 3
                    }
                    if(R.id.radioButton4 == radiogroupLevels.checkedRadioButtonId)
                    {
                        skillLevel = 4
                    }
                    if(R.id.radioButton5 == radiogroupLevels.checkedRadioButtonId)
                    {
                        skillLevel = 5
                    }
                }

                Log.i("testSkill", selectedSkill.skill_Name.toString())
                Log.i("testSkill", skillLevel.toString())
                postEmployeeSkills(selectedSkill, skillLevel)

            }else
            if (imagePath != null && canSendImages)
            {
                val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
                sendImage(imagePath, userID)
            }
        }

        btnUploadDoc = binding.btnUploadDoc

        btnUploadDoc.setOnClickListener()
        {
            Log.i("picFIx","1")
            requestFileAccessPermissions()

        }




        return binding.root
    }

    private fun getSkills(): LiveData<List<Skill>>
    {
        val skills = MutableLiveData<List<Skill>>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getSkills(object : retrofit2.Callback<MutableList<Skill>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Skill>>,
                    response: Response<MutableList<Skill>>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Skill>>, t: Throwable) {
                    value = null
                }
            })
        }
        return skills
    }

    /*private fun getEmployeeSkills(): LiveData<List<Skill>>
    {

        val skills = MutableLiveData<List<Skill>>().apply {
            value = null
            val id = LoginRepository.getInstance()?.user?.userId ?: -1
            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getEmployeeSkills(id, object : retrofit2.Callback<MutableList<Skill>> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<MutableList<Skill>>,
                    response: Response<MutableList<Skill>>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        response.body()
                        Log.i("errrr","1")
                    } else
                    {
                        null
                        Log.i("errrr","2")
                    }

                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<MutableList<Skill>>, t: Throwable) {
                    value = null
                    Log.i("errrr","3")
                }
            })
        }

        return skills
    }*/

    private fun addSpinner(skills : List<Skill>, linearLayout: LinearLayout, context : Context) {
       // val b = Item(this.context)
        //b.text = titleString

        //val items = arrayOf("1", "2", "three")
        var items = ArrayList<String>()
        items.add("N/A");
        for(s : Skill in skills)
        {
            items.add(s.skill_Name)
            listAllSkills.add(s)
        }


        val adapter = ArrayAdapter<String>(context, android.R.layout.simple_spinner_dropdown_item, items)

        spinnerListSkills.setAdapter(adapter)

    }

    private fun addTextView(skill : Skill, linearLayout: LinearLayout) {
        val b = TextView(this.context)
        b.text = "  " + skill.skill_Name
        b.id = skill.skill_ID
        b.fontFeatureSettings = "@font/maven_pro_medium"
        b.setTextAppearance(androidx.appcompat.R.style.TextAppearance_AppCompat_Display1)
        b.setTextColor(Color.BLACK)
        b.textSize = 17F

        //android:textSize="34sp"

        linearLayout.addView(b)
    }


    private fun getSelectedSkill() : Skill
    {
        val selectedSkill = spinnerListSkills.selectedItem.toString()

        if(!selectedSkill.equals("N/A"))
        {
            for(s : Skill in listAllSkills)
            {
                if(s.skill_Name.equals(selectedSkill))
                {
                    return s
                }
            }

        }


        var nullSkill = Skill()
        nullSkill.skill_ID = -10
        return nullSkill

    }

    private fun postEmployeeSkills(skill: Skill, skillLevel: Int)
    {

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out
            val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
            conManager.postEmployeeSkillRequest(userID, skill, skillLevel, object : retrofit2.Callback<Int> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Int>,
                    response: Response<Int>
                ) {
                    //check if the response was successful
                    if (response.isSuccessful) {
                        Toast.makeText(requireContext(),"Update Successful",Toast.LENGTH_LONG).show()

                        if (imagePath != null && canSendImages)
                        {
                            val userID: Int = LoginRepository.getInstance()?.user?.userId ?: -1
                            sendImage(imagePath, userID)
                        }

                    } else
                    {
                        Toast.makeText(requireContext(),"Update failed!",Toast.LENGTH_LONG).show()
                    }
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Int>, t: Throwable) {
                    Toast.makeText(requireContext(),"Update failed!",Toast.LENGTH_LONG).show()
                }
            })

    }

    private fun skillToBridge(skilList : ArrayList<CheckBox>) : ArrayList<Employee_Skill_Bridge>
    {
        val list = ArrayList<Employee_Skill_Bridge>()
        for(s : CheckBox in skilList)
        {
            val bridge = Employee_Skill_Bridge()

            bridge.skill_ID = s.id
            bridge.emp_ID = LoginRepository.getInstance()?.user?.userId ?: -1
            bridge.eS_Enabled = true

            list.add(bridge)
        }

        return list
    }

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

            }
        } else {
            // Permissions are already granted, handle the image selection
            Log.i("picFIx","3")
            openImgPicker()


        }
    }

    private fun openImgPicker() {
        canSendImages = true
        //val gallery = Intent(Intent.ACTION_PICK, )


        val intent = activity?.packageManager
            ?.getLaunchIntentForPackage("com.sec.android.app.myfiles")
        if (intent != null) {
            intent.action = "samsung.myfiles.intent.action.LAUNCH_MY_FILES"
            intent.putExtra("samsung.myfiles.intent.extra.START_PATH",
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).path
            )
            intent.addCategory(Intent.ACTION_PICK)
        }

        val pdfIntent = Intent(Intent.ACTION_GET_CONTENT)
        pdfIntent.type = "*/*"
        pdfIntent.addCategory(Intent.CATEGORY_OPENABLE)


        startActivityForResult(Intent.createChooser(pdfIntent, "Select a file"), 111)

       // startActivityForResult(gallery, pickImage)
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
            Log.i("taggg", file.name)
            //val file = requireContext().contentResolver.openInputStream(uri) ?: return
            var fbody = RequestBody.create(
                MediaType.parse("image/*"),
                file
            )


            if(file.extension.contains("jpg", true) ||  //image
                file.extension.contains("jpeg", true) ||
                file.extension.contains("png", true))
            {
                fbody = RequestBody.create(
                    MediaType.parse("image/*"),
                    file
                )

            }
            else if(file.extension.contains("pdf", true) ||
                file.extension.contains("docx", true))//pdf
            {
                fbody = RequestBody.create(
                    MediaType.parse("application/*"),
                    file
                )

            }else //extension not recognised
            {
                Log.i("File", "extension not recognised")
                Toast.makeText(requireContext(),"File extension not recognised!",Toast.LENGTH_LONG).show()
            }
            Log.i("success maybe extend",file.extension)
            //val fbody = file.asRequestBody("image/*".toMediaTypeOrNull())
            //note: the name - "file" in this case - has to match the name the api is expecting!
            val body = MultipartBody.Part.createFormData("file", file.name, fbody)
            Log.i("createxxx", file.name)
            //val ItemId = RequestBody.create(MultipartBody.FORM, "22")
            //val ImageNumber = RequestBody.create(MultipartBody.FORM, "1")

            val conManager = ApiConnectionManager()
            //get statuses
            conManager.postDoc(body,taskUpdateID, object : retrofit2.Callback<ResponseBody> {
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
                btnUploadDoc.text = getString(R.string.change_document)
            else
                Toast.makeText(requireContext(), "error processing file path", Toast.LENGTH_SHORT).show()
            //imageView.setImageURI(imageUri)
            //update_ImageTemp2 = Task_Update()
            //update_ImageTemp2.update_Image = imageUri.let { context?.contentResolver?.openInputStream(it)?.use { it.buffered().readBytes() } }
        }   //update_ImageTemp2.update_Image = imageUri.let { context?.contentResolver?.openInputStream(it)?.use { it.buffered().readBytes() } } }
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
            Log.d("uri","Uri is of content scheme")
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