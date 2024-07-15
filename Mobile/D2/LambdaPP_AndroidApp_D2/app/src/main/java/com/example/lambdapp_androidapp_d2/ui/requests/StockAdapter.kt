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
import com.example.lambdapp_androidapp_d2.models.Stock

class StockAdapter(private val onClick: (Stock) -> Unit) : ListAdapter<Stock, StockAdapter.StockViewHolder>(
    StockDiffCallback
) {

    private var lastClickedPosition = RecyclerView.NO_POSITION
    inner class StockViewHolder(itemView: View, val onClick: (Stock) -> Unit) : RecyclerView.ViewHolder(itemView) {
        private val stockNameTextView: TextView = itemView.findViewById(R.id.stockName)
        private val stockQuantityTextView: TextView = itemView.findViewById(R.id.stockQuantity)
        private val stockImageView: ImageView = itemView.findViewById(R.id.stockImg)
        private var currentStock: Stock? = null

        init {

            itemView.setOnClickListener {
                currentStock?.let { stock: Stock ->
                    onClick(stock)
                    //it.isSelected = !it.isSelected
                    lastClickedPosition = adapterPosition
                    notifyDataSetChanged()
                    
                }
            }
        }

        /* Bind stock name, quantity and image. */
        fun bind(stock: Stock) {
            currentStock = stock

            stockNameTextView.text = stock.stock_Name
            stockQuantityTextView.text = "Quantity:${stock.stock_Quantity}"


            ApiConnectionManager.loadStockImgSmall(stockImageView.context,stock.stock_ID, stockImageView);
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StockViewHolder {
        //I think this is correct?
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.stock_item, parent, false)
        return StockViewHolder(view, onClick)
    }

    override fun onBindViewHolder(holder: StockViewHolder, position: Int) {
        val stock = getItem(position)
        holder.bind(stock)

        //highlight the selected element
        holder.itemView.isSelected = position== lastClickedPosition
    }
}

object StockDiffCallback : DiffUtil.ItemCallback<Stock>() {
    override fun areItemsTheSame(oldItem: Stock, newItem: Stock): Boolean {
        return oldItem == newItem
    }

    override fun areContentsTheSame(oldItem: Stock, newItem: Stock): Boolean {
        return oldItem.stock_ID == newItem.stock_ID
    }
}