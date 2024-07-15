package com.example.lambdapp_androidapp_d2.ui.calendar

import android.content.Context
import android.graphics.drawable.Drawable
import android.graphics.drawable.ShapeDrawable
import android.graphics.drawable.shapes.RectShape
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import com.example.lambdapp_androidapp_d2.R
import com.prolificinteractive.materialcalendarview.CalendarDay
import com.prolificinteractive.materialcalendarview.DayViewDecorator
import com.prolificinteractive.materialcalendarview.DayViewFacade
import com.prolificinteractive.materialcalendarview.spans.DotSpan


class RangeDecorator(val context: Context, private val taskRanges: List<Pair<CalendarDay,CalendarDay>>) : DayViewDecorator {
    private val highlightDrawable: Drawable

    init {
        highlightDrawable = createHighlightDrawable()
    }

    override fun shouldDecorate(day: CalendarDay): Boolean {
        // Check if the day falls within a "busy" range
        // Return true if it should be decorated, false otherwise
        for(p: Pair<CalendarDay,CalendarDay> in taskRanges)
        {
            if (day.isInRange(p.first, p.second))
                return true
        }
        return false
    }

    override fun decorate(view: DayViewFacade) {
        // Apply the custom background color to the decorated day
        view.setBackgroundDrawable(highlightDrawable)

        //could also draw something like a dot
        //view.addSpan(DotSpan(100f, R.color.PastelRed))

        //or draw an image/drawable
        //AppCompatResources.getDrawable(context, R.drawable.status_progress)?.let { view.setSelectionDrawable(it) }

    }

    private fun createHighlightDrawable(): Drawable {
        val drawable = ShapeDrawable(RectShape())
        DrawableCompat.setTintList(drawable, ContextCompat.getColorStateList(context,
            R.color.PastelRed))
        return drawable
    }

}