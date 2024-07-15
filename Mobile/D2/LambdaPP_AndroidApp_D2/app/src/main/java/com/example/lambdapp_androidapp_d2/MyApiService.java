package com.example.lambdapp_androidapp_d2;

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

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface MyApiService {
    @GET("WeatherForecast")
    Call<List<WeatherForecast>> getForecasts();

    @GET("Employees")
    Call<Employee> login(@Query("Username") String username, @Query("Password") String password);

    @GET("Employees/{id}")
    Call<Employee> getEmployee(@Path("id") Integer id);

    @POST("Employees/register/{code}")
    Call<Employee> register(@Body Employee employee, @Path("code") String code);

    @POST("Employees/update")
    Call<Employee> postDetailsUpdate(@Body Employee employee);

    @POST("Employees/{id}/{skillLevel}/requestAddSkill")
    Call<Integer> postEmployeeSkillRequest(@Path("id") int empID, @Body Skill skill ,@Path("skillLevel") int skillLevel );

    @GET("Tasks")
    Call<List<Task>> getTasks();

    @GET("Tasks/{id}")
    Call<Task> getTask(@Path("id") Integer id);

    @GET("Tasks/{id}/tasksupervisor")
    Call<Employee> getTaskSupervisor(@Path("id") Integer id);
    @GET("Tasks/{id}/employees")
    Call<List<Employee>> getTaskEmployees(@Path("id") Integer id);
    @GET("Tasks/{id}/equipment")
    Call<List<Equipment>> getTaskEquipment(@Path("id") Integer id);

    @GET("Tasks/{id}/equipmentquantity")
    Call<List<Task_Equipment_Bridge>> getTaskEquipmentQuantity(@Path("id") Integer id);
    @GET("Tasks/{id}/updates")
    Call<List<Task_Update>> getTaskUpdates(@Path("id") Integer id);

    @GET("Employees/{id}/tasks")
    Call<List<Task>> getAllEmployeeTasks(@Path("id") Integer id);

    @GET("Employees/{id}/skillsNoLevel")
    Call<List<Skill>> getEmployeeSkills(@Path("id") Integer id);

    @GET("Request/unresolved")
    Call<List<Task_Request>> getRequestsToResolve();

    @PUT("Request/{id}/Approve")
    Call<ResponseBody> approveRequest(@Path("id") Integer id);

    @PUT("Request/{id}/Deny")
    Call<ResponseBody> denyRequest(@Path("id") Integer id);

    @POST("Employees/ratings")
    Call<Integer> postRating(@Body List<Rating> ratings);

    @POST("Employees/feedback")
    Call<Integer> postFeedback(@Body Feedback feedback);

    @GET("Employees/{id}/getFeedback")
    Call<List<Feedback>> getFeedback(@Path("id") Integer id);

    @GET("Employees/{id}/incompletetasks")
    Call<List<Task>> getEmployeeTasks(@Path("id") Integer id);

    @GET("Employees/{id}/completetasks")
    Call<List<Task>> getEmployeeCompletedTasks(@Path("id") Integer id);

    @GET("Employees/{id}/lastUpdatedTasks")
    Call<List<Task>> getEmployeeRecentlyUpdatedTasks(@Path("id") Integer id);

    @GET("Employees/{id}/ratingsfortask")
    Call<List<Rating>> getEmployeeRatingsForTask(@Path("id") Integer id, @Query("taskid") Integer taskid);

    @GET("Employees/{id}/taskrated")
    Call<Integer> getIfTaskRated(@Path("id") Integer id, @Query("taskid") Integer taskid);

    @POST("Tasks/update")
    Call<Task_Update> postUpdate(@Body Task_Update update);

    @GET("Tasks/update/{id}")
    Call<Task_Update> getUpdate(@Path("id") int updateID);

    @GET("Tasks/{id}/hastaskupdatepic")
    Call<Boolean> hasUpdatePic(@Path("id") int updateID);

    @GET("Tasks/{id}/stock")
    Call<List<Stock>> getTaskStock(@Path("id") int taskID);

    @GET("Tasks/{id}/stockquantity")
    Call<List<Task_Stock_Bridge>> getTaskStockQuantity(@Path("id") int taskID);



    @GET("Stocks")
    Call<List<Stock>> getAllStock();

    @GET("Equipments")
    Call<List<Equipment>> getAllEquipment();

    @GET("Status")
    Call<List<Task_Status>> getStatuses();
    @GET("Status/{id}")
    Call<Task_Status> getStatus(@Path("id") int statusID);

    @GET("Skills")
    Call<List<Skill>> getSkills();

    @GET("Notification/{id}")
    Call<List<Notification>> getNotifications(@Path("id") int empID);
    @GET("Notification/{id}/latest/{count}")
    Call<List<Notification>> getNewestNotifications(@Path("id") int empID, @Path("count") int count);
    @GET("Notification/{id}/count")
    Call<Integer> getNotificationCount(@Path("id") int empID);
    @GET("Notification/{id}/unread")
    Call<List<Notification>> getUnreadNotifications(@Path("id") int empID);
    @GET("Notification/{id}/unread/count")
    Call<Integer> getUnreadNotificationCount(@Path("id") int empID);

    @POST("Notification")
    Call<Notification> postNotification(@Body Notification notification);

    @POST("Notification/{id}/viewed")
    Call<Integer> postNotificationViewed(@Path("id") int notID);


    @POST("Tasks/{id}/taskupdatepic")
    Call<ResponseBody> postUpdatePic(@Body byte[] update_Image);

    @POST("Request")
    Call<Task_Request> postRequest(@Body Task_Request request);

    @POST("Notification/{id}/clearnotifications")
    Call<Integer> postClearNotifications(@Path("id") int empID);




    @Multipart
    @POST("Tasks/{id}/taskupdatepic")
    Call<Task_Update> postUpdatePic2(@Header("Authorization") String authorization,
                        @Part("file\"; filename=\"pp.png\" ") RequestBody file,
                        @Part("FirstName") RequestBody fname,
                        @Part("Id") RequestBody id);

    @Multipart
    @POST("Tasks/{id}/taskupdatepic")
    Call<ResponseBody> postUpdatePicx(@Path("id") int id, @Part MultipartBody.Part file);

    @Multipart
    @POST("Employees/{id}/profilepic")
    Call<ResponseBody> postProfilePic(@Path("id") int id, @Part MultipartBody.Part file);

    @Multipart
    @POST("Employees/{id}/document")
    Call<ResponseBody> postDoc(@Path("id") int id, @Part MultipartBody.Part file);



}

