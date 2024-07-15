package com.example.lambdapp_androidapp_d2.ui.admin.requestApproval

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.models.Task_Request
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response

class RequestApprovalAdapter : ListAdapter<Task_Request, RequestApprovalAdapter.RequestViewHolder>(
    RequestDiffCallback
) {

    private var lastClickedPosition = RecyclerView.NO_POSITION
    inner class RequestViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val reqTypeTextView: TextView = itemView.findViewById(R.id.txtReqType)
        private val taskNameTextView: TextView = itemView.findViewById(R.id.txtTaskName)
        private val RequestDescriptionTextView: TextView = itemView.findViewById(R.id.txtRequestDescription)
        private var currentRequest: Task_Request? = null

        init {
            itemView.setOnClickListener {
                currentRequest?.let {
                    //it.isSelected = !it.isSelected
                    lastClickedPosition = adapterPosition
                    notifyDataSetChanged()

                }
            }
        }

        /* Bind stock name, quantity and image. */
        fun bind(request: Task_Request?) {
            if (request == null) return

            currentRequest = request

            if (request.req_Type == "stock")
                reqTypeTextView.text = "Stock Request for " + request.task.task_Name
            else if (request.req_Type == "eqp")
                reqTypeTextView.text = "Equipment Request for " + request.task.task_Name
            else
                reqTypeTextView.text = "Miscellaneous Request for " + request.task.task_Name

            if (request.task != null)
                taskNameTextView.text = request.task.task_Name
            else
                taskNameTextView.text = "Error loading name!"
            RequestDescriptionTextView.text = request.req_Description

            val btnApprove = itemView.findViewById<Button>(R.id.btnApprove)
            val btnDeny = itemView.findViewById<Button>(R.id.btnDeny)

            btnApprove.setOnClickListener {
                ApiConnectionManager().approveRequest(request.req_ID, object : retrofit2.Callback<ResponseBody> {
                    //here we receive a response. Not necessarily successful - could be 404 for example
                    override fun onResponse(
                        call: Call<ResponseBody>,
                        response: Response<ResponseBody>
                    ) {
                        //check if the response was successful
                        if (response.isSuccessful) {
                            val copiedList = this@RequestApprovalAdapter.currentList.toMutableList()
                            copiedList.remove(request)
                            this@RequestApprovalAdapter.submitList(copiedList)

                            /*notifyItemRemoved(pos)
                            notifyItemRangeChanged(pos, itemCount)
                            notifyDataSetChanged()*/
                        } else {
                            //val appContext = context?.applicationContext ?: return
                            //Toast.makeText(appContext, "Error posting update", Toast.LENGTH_LONG).show()
                        }
                    }


                    //failure - an exception t was encountered
                    override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                        //loadingProgressBar.visibility = View.GONE
                        //val appContext = context?.applicationContext ?: return
                        //Toast.makeText(appContext, "Error: " + t.message, Toast.LENGTH_LONG).show()
                    }
                })
            }
            btnDeny.setOnClickListener {
                ApiConnectionManager().denyRequest(request.req_ID, object : retrofit2.Callback<ResponseBody> {
                    //here we receive a response. Not necessarily successful - could be 404 for example
                    override fun onResponse(
                        call: Call<ResponseBody>,
                        response: Response<ResponseBody>
                    ) {
                        //check if the response was successful
                        if (response.isSuccessful) {

                            val copiedList = this@RequestApprovalAdapter.currentList.toMutableList()
                            copiedList.remove(request)
                            this@RequestApprovalAdapter.submitList(copiedList)

                            /*notifyItemRemoved(pos)
                            notifyItemRangeChanged(pos, itemCount)
                            notifyDataSetChanged()*/
                        } else {
                            //val appContext = context?.applicationContext ?: return
                            //Toast.makeText(appContext, "Error posting update", Toast.LENGTH_LONG).show()
                        }
                    }


                    //failure - an exception t was encountered
                    override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                        //loadingProgressBar.visibility = View.GONE
                        //val appContext = context?.applicationContext ?: return
                        //Toast.makeText(appContext, "Error: " + t.message, Toast.LENGTH_LONG).show()
                    }
                })
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RequestViewHolder {
        //I think this is correct?
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.request_to_approve_or_deny, parent, false)
        return RequestViewHolder(view)
    }

    override fun onBindViewHolder(holder: RequestViewHolder, position: Int) {
        val request = getItem(position)
        holder.bind(request)

        //highlight the selected element
        holder.itemView.isSelected = position== lastClickedPosition
    }
}

object RequestDiffCallback : DiffUtil.ItemCallback<Task_Request>() {
    override fun areItemsTheSame(oldItem: Task_Request, newItem: Task_Request): Boolean {
        return oldItem == newItem
    }

    override fun areContentsTheSame(oldItem: Task_Request, newItem: Task_Request): Boolean {
        return oldItem.req_ID == newItem.req_ID
    }
}