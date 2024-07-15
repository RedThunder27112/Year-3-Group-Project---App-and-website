package com.example.lambdapp_androidapp_d2.ui

import android.annotation.SuppressLint
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.updateLayoutParams
import androidx.fragment.app.Fragment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.databinding.FragmentUpdateTimeLineBinding
import com.example.lambdapp_androidapp_d2.models.Task_Status
import com.example.lambdapp_androidapp_d2.models.Task_Update
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.MapsInitializer
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.squareup.picasso.Callback
import retrofit2.Call
import retrofit2.Response
import java.util.*


class UpdateTimeLineFragment : Fragment() {
    private var _binding: FragmentUpdateTimeLineBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentUpdateTimeLineBinding.inflate(inflater, container, false)

        val txtDesc = binding.txtDescription
        val txtPostTime = binding.txtPostedTime
        val txtPoster = binding.txtPoster
        val updatePicLayout = binding.updatePicLayout
        val mapView = binding.mapView
        val empImg = binding.imgUser

        requireActivity().supportFragmentManager.setFragmentResultListener("selectedTaskUpdate",this
        ) { _: String, Result: Bundle ->
            val updateID = Result.getInt("taskUpdateID")

            val taskUpdate = getTaskUpdate(updateID)

            taskUpdate.observe(viewLifecycleOwner)
            { update ->
                if (update != null) {
                    displayUpdateContent(update, txtDesc, txtPostTime, txtPoster, empImg)
                    displayUpdatePic(updatePicLayout, update)

                    //handle map
                    if (update.update_Location != null)
                        displayMap(update, mapView)
                    else {
                        mapView.visibility = View.GONE
                        binding.lblLocation.visibility = View.GONE
                    }
                }
            }
        }

        return binding.root
    }

    private fun displayMap(
        update: Task_Update,
        mapView: MapView
    ) {
        val locationString =
            update.update_Location.substring(update.update_Location.indexOf("(") + 1)
        val latitude = locationString.substring(0, locationString.indexOf(" "))
        val longitude = locationString.substring(
            locationString.indexOf(" ") + 1,
            locationString.indexOf(")")
        )
        val latLng = LatLng(latitude.toDouble(), longitude.toDouble())

        try {
            MapsInitializer.initialize(
                requireContext(), MapsInitializer.Renderer.LATEST
            ) {
                mapView.onCreate(null)
                //getMapAsync(this@UpdateTimeLineFragment)
                mapView.getMapAsync { map ->
                    map.moveCamera(CameraUpdateFactory.newLatLng(latLng))
                    map.setMinZoomPreference(11f)
                    map.addMarker(MarkerOptions().position(latLng))
                    map.mapType = GoogleMap.MAP_TYPE_NORMAL
                }

                mapView.onResume()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("SimpleDateFormat")
    private fun displayUpdateContent(
        update: Task_Update,
        txtDesc: TextView,
        txtPostTime: TextView,
        txtPoster: TextView,
        empImg: ImageView
    ) {

        txtDesc.text = update.update_Description
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
        val outputDateFormat = SimpleDateFormat("dd MMMM yyyy", Locale.ENGLISH)
        val outputTimeFormat = SimpleDateFormat("h:mm a", Locale.ENGLISH)
        val date = inputFormat.parse(update.update_Time)
        "Posted on ${outputDateFormat.format(date)} at ${outputTimeFormat.format(date)}".also {
            txtPostTime.text = it
        }
        if (update.employee != null) {
            "Posted by:\n${update.employee.emp_Name} ${update.employee.emp_Sur}".also {
                txtPoster.text = it
            }
            ApiConnectionManager.loadProfilePicSmall(requireContext(), update.emp_ID, empImg)
            //show an image dialog if the profile pic is pressed
            empImg.setOnClickListener{ApiConnectionManager.showImageDialog(requireContext(),ApiConnectionManager.ProfilePicIp(update.emp_ID))}
        }

        //handle stock and equipment updates.
        //if the status says it's an stock approval/rejection, then instead of saying "Posted by" say "Requested by"
        if (update.updated_Status_ID != null)
        {
            val taskStatus = getTaskStatus(update.updated_Status_ID)

            taskStatus.observe(viewLifecycleOwner)
            { status ->
                if (status != null) {
                    txtDesc.text =
                        "${update.update_Description}\n\nTask status updated to ${status.status_Name}"
                    if (status.status_Name=="RESOURCES REQUESTED"||status.status_Name=="RESOURCES ALLOCATED"||status.status_Name=="RESOURCES DENIED")
                        if (update.employee != null) {
                            "Requested by:\n${update.employee.emp_Name} ${update.employee.emp_Sur}".also {
                                txtPoster.text = it
                            }
                        }
                }

            }
        }

    }

    private fun getTaskStatus(statusID: Int): LiveData<Task_Status>
    {
        val status = MutableLiveData<Task_Status>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            conManager.getStatus( statusID, object : retrofit2.Callback<Task_Status> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Task_Status>,
                    response: Response<Task_Status>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }

                //failure - an exception t was encountered
                override fun onFailure(call: Call<Task_Status>, t: Throwable) {
                    value = null
                }
            })
        }
        return status
    }

    /*private fun byteToBitmap(b: ByteArray?): Bitmap? {
        return if (b == null || b.isEmpty()) null else BitmapFactory
            .decodeByteArray(b, 0, b.size)
    }*/
    private fun getTaskUpdate(updateID: Int): LiveData<Task_Update>
    {
        val update = MutableLiveData<Task_Update>().apply {
            value = null

            //create the connection manager
            val conManager = ApiConnectionManager()
            //run the get function - gotta override the callback object's 2 functions,
            // so we wait until a response is received or the connection fails/times out

            conManager.getTaskUpdate( updateID, object : retrofit2.Callback<Task_Update> {
                //here we receive a response. Not necessarily successful - could be 404 for example
                override fun onResponse(
                    call: Call<Task_Update>,
                    response: Response<Task_Update>
                ) {
                    //check if the response was successful
                    value = if (response.isSuccessful) {
                        response.body()
                    } else
                        null
                }
                //failure - an exception t was encountered
                override fun onFailure(call: Call<Task_Update>, t: Throwable) {
                    value = null
                }
            })
        }

        return update
    }

    private fun displayUpdatePic(updateLayout: LinearLayout, e: Task_Update) {
        val imageView = ImageView(this.requireContext())
        /*updateLayout.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )*/

        //imageView.background = AppCompatResources.getDrawable(requireContext(),R.drawable.border)
        ApiConnectionManager.loadUpdatePicWithCallback(this.requireContext(),e.update_ID, imageView, object: Callback {
            override fun onSuccess() {
                //make it smaller
                imageView.updateLayoutParams {
                    this.height = 400
                    this.width = 400
                }
                /*updateLayout.updateLayoutParams {
                    this.height =  0
                    this.width =  LinearLayout.LayoutParams.WRAP_CONTENT
                }*/
                imageView.scaleType = ImageView.ScaleType.CENTER_CROP
                //imageView.background = AppCompatResources.getDrawable(requireContext(),R.drawable.border)

            }

            override fun onError(e: java.lang.Exception?) {
                updateLayout.visibility = View.GONE
                binding.lblPictures.visibility = View.GONE
            }

        })
        imageView.setOnClickListener{ApiConnectionManager.showImageDialog(requireContext(),ApiConnectionManager.UpdatePicIp(e.update_ID))}

        val itemLayout = LinearLayout(this.requireContext())
        itemLayout.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        itemLayout.orientation = LinearLayout.HORIZONTAL
        itemLayout.addView(imageView)

        updateLayout.addView(itemLayout)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }



    //attempts to make a nice border. might still be useful?
    /*val target = object : com.squareup.picasso.Target {
        override fun onBitmapLoaded(bitmap: Bitmap, from: LoadedFrom?) {
            // Adjust the border drawable dimensions to match the image
            //imgView.maxWidth = bitmap.width
            //imgView.minimumWidth = bitmap.width
            //imgView.maxHeight = bitmap.height
            //imgView.minimumHeight = bitmap.height
            val borderDrawable = imgView.background as GradientDrawable
            borderDrawable.setSize( bitmap.width, bitmap.height)
            // Set the loaded image into the ImageView
            imgView.setImageBitmap(bitmap)
        }

        override fun onBitmapFailed(e: java.lang.Exception?, errorDrawable: Drawable?) {
            //
        }

        override fun onPrepareLoad(placeHolderDrawable: Drawable?) {
            //
        }
    }*/

}