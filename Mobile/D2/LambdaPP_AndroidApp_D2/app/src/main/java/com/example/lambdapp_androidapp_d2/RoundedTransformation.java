package com.example.lambdapp_androidapp_d2;

import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;

public class RoundedTransformation implements com.squareup.picasso.Transformation {

    private final int radius;
    private final int margin;

    public RoundedTransformation(int radius, int margin)
    {
        this.radius = radius;
        this.margin = margin;
    }

    @Override
    public Bitmap transform(Bitmap source) {
        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setShader(new BitmapShader(source, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP));
        Bitmap out = Bitmap.createBitmap(source.getWidth(),source.getHeight(),Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(out);
        canvas.drawRoundRect(new RectF(margin,margin,source.getWidth() - margin, source.getHeight() - margin), radius,radius,paint);
        if (source != out) source.recycle();
        return out;

    }

    @Override
    public String key() {
        return "rounded";
    }
}
