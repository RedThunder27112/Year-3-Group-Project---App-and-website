package com.example.lambdapp_androidapp_d2.ui.requests
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.lambdapp_androidapp_d2.ApiConnectionManager
import com.example.lambdapp_androidapp_d2.R
import com.example.lambdapp_androidapp_d2.models.Equipment

class EqpAdapter(private val onClick: (Equipment) -> Unit) : ListAdapter<Equipment, EqpAdapter.EqpViewHolder>(
    EqpDiffCallback
) {

    private var lastClickedPosition = RecyclerView.NO_POSITION
    inner class EqpViewHolder(itemView: View, val onClick: (Equipment) -> Unit) : RecyclerView.ViewHolder(itemView) {
        private val eqpNameTextView: TextView = itemView.findViewById(R.id.eqpName)
        private val eqpQuantityTextView: TextView = itemView.findViewById(R.id.eqpQuantity)
        private val eqpImageView: ImageView = itemView.findViewById(R.id.eqpImg)
        private var currentEqp: Equipment? = null


        init {
            itemView.setOnClickListener {
                currentEqp?.let { eqp: Equipment ->
                    onClick(eqp)
                    //it.isSelected = !it.isSelected
                    lastClickedPosition = adapterPosition
                    notifyDataSetChanged()
                    
                }
            }
        }

        /* Bind stock name, quantity and image. */
        fun bind(eqp: Equipment) {
            currentEqp = eqp

            eqpNameTextView.text = eqp.eqp_Name
            "Quantity:${eqp.eqp_Quantity_Total}".also { eqpQuantityTextView.text = it }

            ApiConnectionManager.loadEqpImgSmall(eqpImageView.context,eqp.eqp_ID, eqpImageView)
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EqpViewHolder {
        //I think this is correct?
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.eqp_item, parent, false)
        return EqpViewHolder(view, onClick)
    }

    override fun onBindViewHolder(holder: EqpViewHolder, position: Int) {
        val eqp = getItem(position)
        holder.bind(eqp)

        //highlight the selected element
        holder.itemView.isSelected = position== lastClickedPosition
    }
}

object EqpDiffCallback : DiffUtil.ItemCallback<Equipment>() {
    override fun areItemsTheSame(oldItem: Equipment, newItem: Equipment): Boolean {
        return oldItem == newItem
    }

    override fun areContentsTheSame(oldItem: Equipment, newItem: Equipment): Boolean {
        return oldItem.eqp_ID == newItem.eqp_ID
    }
}