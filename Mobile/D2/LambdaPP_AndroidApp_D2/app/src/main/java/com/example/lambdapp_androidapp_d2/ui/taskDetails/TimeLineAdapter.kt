package com.example.lambdapp_androidapp_d2.ui.taskDetails

import android.annotation.SuppressLint
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.FragmentManager
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import androidx.vectordrawable.graphics.drawable.VectorDrawableCompat
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.databinding.FragmentTimelineBinding
import com.example.lambdapp_androidapp_d2.models.Task_Update
import com.github.vipulasri.timelineview.TimelineView
import retrofit2.Call
import retrofit2.Response

class TimeLineAdapter(private val mFeedList: List<Task_Update>, private val SupportManager: FragmentManager) : RecyclerView.Adapter<TimeLineAdapter.TimeLineViewHolder>() {

    //private lateinit var mLayoutInflater: LayoutInflater
    private lateinit var mDefaultAttributes: TimelineAttributes

    override fun getItemViewType(position: Int): Int {
        return TimelineView.getTimeLineViewType(position, itemCount)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TimeLineViewHolder {
        //default values
        mDefaultAttributes = TimelineAttributes(
            markerSize = 200,
            markerColor =R.color.DarkestPaleBlue,
            markerInCenter = true,
            markerLeftPadding = 0,
            markerTopPadding = 0,
            markerRightPadding = 0,
            markerBottomPadding =0,
            linePadding = 200,
            startLineColor = R.color.PaleBlue,
            endLineColor = R.color.PaleBlue,
            lineStyle = TimelineView.LineStyle.NORMAL,
            lineWidth = 200,
            lineDashWidth =400,
            lineDashGap = 200
        )


        val binding = FragmentTimelineBinding.inflate(LayoutInflater.from(parent.context), parent, false)

        return TimeLineViewHolder(binding, mDefaultAttributes)
    }

    @SuppressLint("SimpleDateFormat")
    override fun onBindViewHolder(holder: TimeLineViewHolder, position: Int) {
        //this is basically when the individual timeline item is loaded on the screen. Tells it how to render, what the onclick must be, etc.
        //does it only when it's on screen to save memory and time - that's why it's a recycler view wooah
        //this gets the specific timeline item
        val timeLineModel = mFeedList[position]

       // val image: Drawable = BitmapDrawable(getResources(), BitmapFactory.decodeByteArray(timeLineModel.employee.emp_ID_Image, 0, timeLineModel.employee.emp_ID_Image.length))
        //can have some code to determine different markers based on status, like this:
        /*when {
            timeLineModel.status == OrderStatus.INACTIVE -> {
                setMarker(holder, R.drawable.ic_marker_inactive, R.color.material_grey_500)
            }
            timeLineModel.status == OrderStatus.ACTIVE -> {
                setMarker(holder, R.drawable.ic_marker_active, R.color.material_grey_500)
            }
            else -> {
                setMarker(holder, R.drawable.ic_marker, R.color.material_grey_500)
            }
        }
        */
        //just 1 type of timeline item for now
        //val b: ByteArray = getByteArray()
        //val `is` = ByteArrayInputStream(b)
        //val drw = Drawable.createFromStream(`is`, "articleImage")

        //this is what sets the images for the timeline

        //sensible order for priority:
        //1: If is

        if(timeLineModel.updated_Status_ID == 1)
        {
            setMarker(holder, R.drawable.progress, R.color.DarkestPaleBlue)
        }else
        if(timeLineModel.updated_Status_ID == 2)
        {
            setMarker(holder, R.drawable.tick, R.color.DarkestPaleBlue)
        }else
        if(timeLineModel.updated_Status_ID == 3)
        {
            setMarker(holder, R.drawable.waiting, R.color.DarkestPaleBlue)
        }else
        if(timeLineModel.update_Location != null)
        {
            setMarker(holder, R.drawable.location, R.color.DarkestPaleBlue)
        }else
        {
            setMarker(holder, R.drawable.loading_foreground, R.color.DarkestPaleBlue)

            //see if it has a pic
            ApiConnectionManager().hasTaskUpdatePic(timeLineModel.update_ID, object : retrofit2.Callback<Boolean>{
                override fun onResponse(call: Call<Boolean>, response: Response<Boolean>) {
                    if (response.isSuccessful)
                        if (response.body() == true)
                        {
                            setMarker(holder, R.drawable.ic_menu_camera, R.color.DarkestPaleBlue)
                            return
                        }
                    setMarker(holder, R.drawable.info, R.color.DarkestPaleBlue)
                }

                override fun onFailure(call: Call<Boolean>, t: Throwable) {
                    setMarker(holder, R.drawable.info, R.color.DarkestPaleBlue)
                }

            })

        }



        //display the correct text
        if (timeLineModel.update_Time.isNotEmpty()) {
            holder.binding.textTimelineDate.visibility = View.VISIBLE
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            val outputFormat = SimpleDateFormat("MM/dd HH:mm")
            val date = inputFormat.parse(timeLineModel.update_Time)
            holder.binding.textTimelineDate.text = outputFormat.format(date)


        } else
            holder.binding.textTimelineDate.visibility = View.GONE



        holder.binding.textTimelineTitle.text =  if (timeLineModel.update_Description.length > 25)
        {
            timeLineModel.update_Description.substring(0..22) + "..."
        } else {
            timeLineModel.update_Description
        }

        //holder.itemView.setBackgroundResource(R.drawable.userpic)//.setBackgroundDrawable(getDrawable(R.drawable.userpic))//.background = R.drawable.userpic

        //set the onclick for each timeline update, to direct the user to that timeline update page
        holder.itemView.setOnClickListener {
            val result = Bundle()
            result.putInt("taskUpdateID",timeLineModel.update_ID)
            /*holder.binding.root.requireActivity().supportFragmentManager.setFragmentResult("selectedTaskUpdate",Result)
            holder.binding.root.findNavController().navigate(R.id.action_nav_taskDetails_to_nav_update_timeline)*/
            //holder.itemView.findNavController().previousBackStackEntry?.savedStateHandle?.set("selectedTaskUpdate", Result)
            SupportManager.setFragmentResult("selectedTaskUpdate",result)
            holder.itemView.findNavController().navigate(R.id.action_nav_taskDetailsParent_to_nav_update_timeline)
        }
    }

    private fun setMarker(holder: TimeLineViewHolder, drawableResId: Int, colorFilter: Int) {

        holder.timeline.marker = VectorDrawableCompat.create(holder.itemView.context.resources, drawableResId, holder.itemView.context.theme)

    }


    override fun getItemCount() = mFeedList.size

    inner class TimeLineViewHolder(val binding: FragmentTimelineBinding, mAttributes: TimelineAttributes) : RecyclerView.ViewHolder(binding.root) {
        val timeline = binding.timeline

        init {
            val viewType =  TimelineView.getTimeLineViewType(adapterPosition, itemCount)

            //lays out the properties of the timeline line. Doesn't really seem to be working at the moment, but it looks okay
            timeline.initLine(viewType)
            timeline.markerSize = mAttributes.markerSize
            timeline.setMarkerColor(mAttributes.markerColor)
            timeline.isMarkerInCenter = mAttributes.markerInCenter
            timeline.markerPaddingLeft = mAttributes.markerLeftPadding
            timeline.markerPaddingTop = mAttributes.markerTopPadding
            timeline.markerPaddingRight = mAttributes.markerRightPadding
            timeline.markerPaddingBottom = mAttributes.markerBottomPadding
            timeline.linePadding = mAttributes.linePadding
            timeline.lineWidth = mAttributes.lineWidth
            timeline.setStartLineColor(mAttributes.startLineColor, viewType)
            timeline.setEndLineColor(mAttributes.endLineColor, viewType)
            timeline.lineStyle = mAttributes.lineStyle
            timeline.lineStyleDashLength = mAttributes.lineDashWidth
            timeline.lineStyleDashGap = mAttributes.lineDashGap
        }
    }

}

class TimelineAttributes(
    var markerSize: Int,
    var markerColor: Int,
    var markerInCenter: Boolean,
    var markerLeftPadding: Int,
    var markerTopPadding: Int,
    var markerRightPadding: Int,
    var markerBottomPadding: Int,
    var linePadding: Int,
    var lineWidth: Int,
    var startLineColor: Int,
    var endLineColor: Int,
    var lineStyle: Int,
    var lineDashWidth: Int,
    var lineDashGap: Int
) {
}
