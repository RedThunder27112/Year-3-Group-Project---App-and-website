package com.example.lambdapp_androidapp_d2;

import static android.content.ContentValues.TAG;

import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;
import android.widget.ImageButton;
import android.widget.ImageView;

import androidx.annotation.NonNull;

import com.example.lambdapp_androidapp_d2.models.Employee;
import com.example.lambdapp_androidapp_d2.models.Employee_Skill_Bridge;
import com.example.lambdapp_androidapp_d2.models.Equipment;
import com.example.lambdapp_androidapp_d2.models.Feedback;
import com.example.lambdapp_androidapp_d2.models.Notification;
import com.example.lambdapp_androidapp_d2.models.Rating;
import com.example.lambdapp_androidapp_d2.models.Skill;
import com.example.lambdapp_androidapp_d2.models.Stock;
import com.example.lambdapp_androidapp_d2.models.Task;
import com.example.lambdapp_androidapp_d2.models.Task_Equipment_Bridge;
import com.example.lambdapp_androidapp_d2.models.Task_Request;
import com.example.lambdapp_androidapp_d2.models.Task_Status;
import com.example.lambdapp_androidapp_d2.models.Task_Stock_Bridge;
import com.example.lambdapp_androidapp_d2.models.Task_Update;
import com.example.lambdapp_androidapp_d2.models.WeatherForecast;
import com.squareup.picasso.OkHttp3Downloader;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import org.jetbrains.annotations.NotNull;

import java.text.SimpleDateFormat;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.concurrent.TimeUnit;


import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

public class ApiConnectionManager {


    public static final String LocalIPAddress = "https://10.0.2.2:7051";
    public static final String DeployedIPAddress = "https://10.0.2.2:5001";
    public static final String PhoneIPAddress = "https://192.168.1.117:7051";
    public static final String GageIPAddress = "https://192.168.1.117:7051";

    public static final String IPAddress = PhoneIPAddress;

    //how long before the connection will wait before timeout
    public static final int TIMEOUT_SECS = 15;
    MyApiService service;

    public ApiConnectionManager() {
        try
        {
            //OkHttpClient client = getHttpClient();
            OkHttpClient client = createOkHttpClient();
            //create the retrofit api accessor
            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl(IPAddress)
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(client)
                    .build();
            //create the service
            service = retrofit.create(MyApiService.class);
        }
        catch (Exception ex)
        {
            Log.e(TAG, "Failed to establish SSL connection to server: " + ex);
        }
    }

    @NonNull
    private static OkHttpClient getHttpClient() {
        //create a client with settings
        return new OkHttpClient().newBuilder()
                .connectTimeout(TIMEOUT_SECS, TimeUnit.SECONDS)
                .readTimeout(TIMEOUT_SECS, TimeUnit.SECONDS)
                .retryOnConnectionFailure(true)
                .hostnameVerifier(new NullHostNameVerifier()) //this was the one thing that fixed everything!!!
                .build();
    }

    private static OkHttpClient createOkHttpClient() {
        try {
            final TrustManager[] trustAllCerts = new TrustManager[] {
                    new X509TrustManager() {
                        @Override
                        public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {}

                        @Override
                        public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {}

                        @Override
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return new java.security.cert.X509Certificate[]{};
                        }
                    }
            };
            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            return new OkHttpClient.Builder()
                    .connectTimeout(TIMEOUT_SECS, TimeUnit.SECONDS)
                    .readTimeout(TIMEOUT_SECS, TimeUnit.SECONDS)
                    .retryOnConnectionFailure(true)
                    .sslSocketFactory(sslContext.getSocketFactory())
                    .hostnameVerifier((hostname, session) -> true)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    //image handling
    public static Picasso generatePicasso(Context context) {
        //builds a picasso instance used to download images better than retrofit
        return new Picasso.Builder(context).downloader(new OkHttp3Downloader(createOkHttpClient())).build();
    }
    //image loading
    public static void loadRoundedPic(Context context, String imageUrl, ImageView img, int radius, int margin) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground)
                .transform(new RoundedTransformation(radius,margin)).error(R.drawable.failimage).into(img);
    }
    public static void loadRoundedPic(Context context, String imageUrl, ImageView img, int radius, int margin, int width, int height) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground).resize(width, height).centerCrop()
                .transform(new RoundedTransformation(radius,margin)).error(R.drawable.failimage).into(img);
    }
    public static void loadRoundedPic(Context context, String imageUrl, ImageView img, int radius, int margin, com.squareup.picasso.Callback callBack) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground)
                .transform(new RoundedTransformation(radius,margin)).error(R.drawable.failimage).into(img, callBack);
    }
    public static void loadRoundedPic(Context context, String imageUrl, ImageView img, int radius, int margin, int width, int height, com.squareup.picasso.Callback callBack) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground).resize(width, height).centerCrop()
                .transform(new RoundedTransformation(radius,margin)).error(R.drawable.failimage).into(img, callBack);
    }
    public static void loadPic(Context context, String imageUrl, ImageView img) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground)
               .error(R.drawable.failimage).into(img);
    }
    public static void loadPic(Context context, String imageUrl, ImageView img, int width, int height) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground).resize(width, height).centerCrop()
                .error(R.drawable.failimage).into(img);
    }
    public static void loadPic(Context context, String imageUrl, Target img) {
        //generate a picasso instance
        Picasso picasso = ApiConnectionManager.generatePicasso(context);

        //picasso.isLoggingEnabled = true;
        picasso.load(imageUrl).placeholder(R.drawable.loading_foreground)
                .error(R.drawable.failimage).into(img);
    }

    //getting correct IP
    public static String ProfilePicIp(int id)
    {
        return IPAddress + "/Employees/" + id + "/profilepic";
    }
    public static String UpdatePicIp(int id)
    {
        return IPAddress + "/Tasks/" + id + "/taskupdatepic";
    }
    //formatted/predefined ways to load images
    public static void loadProfilePic(Context context, int emp_ID, ImageView imgProfilePic) {
        loadRoundedPic(context, ProfilePicIp(emp_ID),imgProfilePic,30,25);
    }

    public static void loadUpdatePic(Context context, int update_ID, ImageView imgUpdatePic) {
        loadRoundedPic(context, UpdatePicIp(update_ID),imgUpdatePic,30,25);
    }
    public static void loadUpdatePic(Context context, int update_ID, Target imgUpdatePic) {
        loadPic(context,UpdatePicIp(update_ID),imgUpdatePic);
    }

    public static void loadUpdatePicWithCallback(Context context, int update_ID, ImageView imgUpdatePic, com.squareup.picasso.Callback callBack) {
        loadRoundedPic(context, UpdatePicIp(update_ID),imgUpdatePic,30,25,400,400,callBack);
    }
    public static void loadProfilePicSmall(Context context, int emp_ID, ImageView imgProfilePic) {
        loadRoundedPic(context,ProfilePicIp(emp_ID),imgProfilePic,30,5,200,200);
    }

    public static void loadStockImgSmall(Context context, int stock_ID, ImageView imgStockPic) {
        String imageUrl = IPAddress + "/Stocks/" + stock_ID + "/image";
        loadPic(context,imageUrl,imgStockPic,170,170);
    }

    public static void loadEqpImgSmall(Context context, int eqp_ID, ImageView imgEqpPic) {
        String imageUrl = IPAddress + "/Equipments/" + eqp_ID + "/image";
        loadPic(context,imageUrl,imgEqpPic,200,200);
    }
    public static void showImageDialog(Context context, String IP) {
        //create dialog and get components
        Dialog dialog = new Dialog(context);
        dialog.setContentView(R.layout.imageview_dialog);
        dialog.show();
        ImageView imgView = dialog.findViewById(R.id.imgPopup);

        loadRoundedPic(context, IP, imgView, 30, 25);
        imgView.setMinimumHeight(450);
        imgView.setMinimumWidth(450);
        dialog.findViewById(R.id.imgBtnClose2).setOnClickListener(e -> dialog.dismiss());
    }

    /* --TO ADD A NEW API CALL--
    * STEP 1: Ensure that the call is set up on the API side. Eg a GET function for weather forecasts
    *         See how it's set up on that side to know how to call it. We just need to call localhost:port/WeatherForecast
    * Step 2: Go to the MyApiService class. Add the new function and label it properly eg @GET(WeatherForecast) or @POST(whatever)
    * Step 3: Create a function here. Look at getWeatherForecasts for how to template it
    * Step 4: Call the function in your relevant UI fragment. See HomeViewModel for an example. or look at the code
    *         at the bottom of this class
    *  */


    //reading from the api

    public void login(String Username, String Password, Callback<Employee> callback){
        service.login(Username, Password).enqueue(callback);
    }

    public void getEmployee(Integer id, Callback<Employee> callback) {
        service.getEmployee(id).enqueue(callback);
    }

    @SuppressLint("SimpleDateFormat")
    public void register(String Username, String Password, String name, String surname, String code, Callback<Employee> callback){
        Employee employee = new Employee();
        employee.emp_Username = Username;
        employee.emp_Password = Password;
        employee.emp_Name = name;
        employee.emp_Sur = surname;
        employee.emp_DateRegistered = (new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")).format(GregorianCalendar.getInstance().getTime());
        service.register(employee, code).enqueue(callback);
    }

    public void postDetailsUpdate(Employee employee, Callback<Employee> callback){
        service.postDetailsUpdate(employee).enqueue(callback);
    }

    public void postEmployeeSkillRequest(int empID, Skill skill , int skillLevel, Callback<Integer> callback){
        service.postEmployeeSkillRequest(empID, skill , skillLevel).enqueue(callback);
    }

    public void getTasks(Callback<List<Task>> callback) {
        service.getTasks().enqueue(callback);
    }
    public void getTask( Integer id, Callback<Task> callback) {
        service.getTask(id).enqueue(callback);
    }

    public void getTaskEquipment( Integer id, Callback<List<Equipment>> callback) {
        service.getTaskEquipment(id).enqueue(callback);
    }

    public void getTaskEquipmentQuantity( Integer id, Callback<List<Task_Equipment_Bridge>> callback) {
        service.getTaskEquipmentQuantity(id).enqueue(callback);
    }
    public void getTaskUpdates( Integer id, Callback<List<Task_Update>> callback) {
        service.getTaskUpdates(id).enqueue(callback);
    }

    public void getTaskSupervisor( Integer id, Callback<Employee> callback) {
        service.getTaskSupervisor(id).enqueue(callback);
    }


    public void getTaskEmployees( Integer id, Callback<List<Employee>> callback) {
        service.getTaskEmployees(id).enqueue(callback);
    }

    public void getEmployeeTasks( Integer id, Callback<List<Task>> callback) {
        service.getEmployeeTasks(id).enqueue(callback);
    }

    public void getAllEmployeeTasks( Integer id, Callback<List<Task>> callback) {
        service.getAllEmployeeTasks(id).enqueue(callback);
    }

    public void getEmployeeCompletedTasks( Integer id, Callback<List<Task>> callback) {
        service.getEmployeeCompletedTasks(id).enqueue(callback);
    }

    public void getEmployeeRecentlyUpdatedTasks( Integer id, Callback<List<Task>> callback) {
        service.getEmployeeRecentlyUpdatedTasks(id).enqueue(callback);
    }

    public void getEmployeeRatingsForTask( Integer id, Integer taskid, Callback<List<Rating>> callback) {
        service.getEmployeeRatingsForTask(id,taskid).enqueue(callback);
    }

    public void getIfTaskRated( Integer id, Integer taskid, Callback<Integer> callback) {
        service.getIfTaskRated(id,taskid).enqueue(callback);
    }

    public void getRequestsToResolve(Callback<List<Task_Request>> callback) {
        service.getRequestsToResolve().enqueue(callback);
    }
    public void approveRequest( Integer id, Callback<ResponseBody> callback)
    {
        service.approveRequest(id).enqueue(callback);
    }

    public void denyRequest( Integer id, Callback<ResponseBody> callback)
    {
        service.denyRequest(id).enqueue(callback);
    }

    public void postUpdate(Task_Update update, Callback<Task_Update> callback) {
        service.postUpdate(update).enqueue(callback);
    }

    public void postRequest(Task_Request request, Callback<Task_Request> callback) {
        service.postRequest(request).enqueue(callback);
    }

    public void getTaskUpdate(int updateID, Callback<Task_Update> callback) {
        service.getUpdate(updateID).enqueue(callback);
    }
    public void hasTaskUpdatePic(int updateID, Callback<Boolean> callback) {
        service.hasUpdatePic(updateID).enqueue(callback);
    }

    public void getTaskStock(int taskID, Callback<List<Stock>> callback) {
        service.getTaskStock(taskID).enqueue(callback);
    }

    public void getTaskStockQuantity(int taskID, Callback<List<Task_Stock_Bridge>> callback) {
        service.getTaskStockQuantity(taskID).enqueue(callback);
    }

    public void getStatuses(Callback<List<Task_Status>> callback) {
        service.getStatuses().enqueue(callback);
    }

    public void getStatus(Integer id, Callback<Task_Status> callback) {
        service.getStatus(id).enqueue(callback);
    }

    public void getSkills(Callback<List<Skill>> callback) {
        service.getSkills().enqueue(callback);
    }

    public void getEmployeeSkills(int id, Callback<List<Skill>> callback) {
        service.getEmployeeSkills(id).enqueue(callback);
    }

    public void getNotifications(int empID, Callback<List<Notification>> callback) {
        service.getNotifications(empID).enqueue(callback);
    }
    public void getNewestNotifications(int empID, int count, Callback<List<Notification>> callback) {
        service.getNewestNotifications(empID, count).enqueue(callback);
    }
    public void getUnreadNotifications(int empID, Callback<List<Notification>> callback) {
        service.getUnreadNotifications(empID).enqueue(callback);
    }
    public void getNotificationCount(int empID, Callback<Integer> callback) {
        service.getNotificationCount(empID).enqueue(callback);
    }
    public void getUnreadNotificationCount(int empID, Callback<Integer> callback) {
        service.getUnreadNotificationCount(empID).enqueue(callback);
    }

    public void postNotification(Notification notification,Callback<Notification> callback) {
        service.postNotification(notification).enqueue(callback);
    }

    public void postNotificationViewed(int notID, Callback<Integer> callback) {
        service.postNotificationViewed(notID).enqueue(callback);
    }

    public void postRating(List<Rating> ratings,Callback<Integer> callback) {
        service.postRating(ratings).enqueue(callback);
    }

    public void postFeedback(Feedback feedback, Callback<Integer> callback) {
        service.postFeedback(feedback).enqueue(callback);
    }

    public void postClearNotifications(int empID, Callback<Integer> callback) {
        service.postClearNotifications(empID).enqueue(callback);
    }






    public void postUpdatePic( byte[] update_Image,int updateID, Callback<ResponseBody> callback) {
        service.postUpdatePic(update_Image).enqueue(callback);
    }


    public void postUpdatePicx(MultipartBody.Part image, int updateID, Callback<ResponseBody> callback)
    {
        service.postUpdatePicx(updateID,image).enqueue(callback);
    }
    public void postProfilePic(MultipartBody.Part image, int empID, Callback<ResponseBody> callback)
    {
        service.postProfilePic(empID,image).enqueue(callback);
    }

    public void postDoc(MultipartBody.Part image, int empID, Callback<ResponseBody> callback)
    {
        service.postDoc(empID,image).enqueue(callback);
    }



    public void getAllStock(Callback<List<Stock>> callback) {
        service.getAllStock().enqueue(callback);
    }

    public void getAllEquipment(Callback<List<Equipment>> callback) {
        service.getAllEquipment().enqueue(callback);
    }

    public void getFeedback(int id, Callback<List<Feedback>> callback) {
        service.getFeedback(id).enqueue(callback);
    }




    /* alt method: live data that can be listened to
    public LiveData<List<WeatherForecast>> getWeatherForecasts() {
        MutableLiveData<List<WeatherForecast>> result = new MutableLiveData<List<WeatherForecast>>();

        Call<List<WeatherForecast>> callforecasts = service.getForecasts();
        callforecasts.enqueue(new Callback<List<WeatherForecast>>() {
            @Override
            public void onResponse(Call<List<WeatherForecast>> call, Response<List<WeatherForecast>> response) {
                if (response.isSuccessful()) {
                    result.postValue(response.body());
                }
                else
                    System.err.println("Unsuccessful: " + response.code());
            }

            @Override
            public void onFailure(Call<List<WeatherForecast>> call, Throwable t) {
                System.err.println("Failure: " + t.getMessage());
            }
        });

        return result;
    }*/

    //writing to the api

}


//Code that I made in my attempts to fix things: May come in useful later

/*
            // Load CAs from an InputStream
            // (could be from a resource or ByteArrayInputStream or ...)
            CertificateFactory cf = CertificateFactory.getInstance("X.509");

            // My CRT file that I put in the assets folder
            // * Saved the file as localhost.crt (type X.509 Certificate (PEM))
            // The MainActivity.context is declared as:
            // public static Context context;
            // And initialized in MainActivity.onCreate() as:
            // MainActivity.context = getApplicationContext();
            InputStream caInput = new BufferedInputStream(MainActivity.context.getAssets().open("localhost.crt"));
            Certificate ca = cf.generateCertificate(caInput);

            // Create a KeyStore containing our trusted CAs
            String keyStoreType = KeyStore.getDefaultType();
            KeyStore keyStore = KeyStore.getInstance(keyStoreType);
            keyStore.load(null, null);
            keyStore.setCertificateEntry("ca", ca);

            // Create a TrustManager that trusts the CAs in our KeyStore
            String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
            tmf.init(keyStore);

            // Create an SSLContext that uses our TrustManager
            SSLContext context = SSLContext.getInstance("TLS");
            context.init(null, tmf.getTrustManagers(), null);

            /* // Tell the URLConnection to use a SocketFactory from our SSLContext
            URL url = new URL("https://10.0.2.2:7112");
            HttpsURLConnection urlConnection = (HttpsURLConnection)url.openConnection();
            urlConnection.setSSLSocketFactory(context.getSocketFactory());*/
//and then when building the client
    //.sslSocketFactory(context.getSocketFactory(), (X509TrustManager) tmf.getTrustManagers()[0])


//how to call an api function in java
/*Call<List<WeatherForecast>> callforecasts = service.getForecasts();
            callforecasts.enqueue(new Callback<List<WeatherForecast>>() {
                @Override
                public void onResponse(Call<List<WeatherForecast>> call, Response<List<WeatherForecast>> response) {
                    if (response.isSuccessful()) {
                        forecasts = response.body();
                        IsSuccessful[0] =true;
                    }
                    else
                        System.err.println("Unsuccessful: " + response.code());
                }

                @Override
                public void onFailure(Call<List<WeatherForecast>> call, Throwable t) {
                    System.err.println("Failure: " + t.getMessage());
                }
            });*/
