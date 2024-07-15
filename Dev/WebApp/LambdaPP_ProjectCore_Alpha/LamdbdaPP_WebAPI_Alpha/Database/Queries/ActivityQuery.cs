using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "activity" table
    public class ActivityQuery : AbstractQuery
    {
        //calls base constructor
        public ActivityQuery(MyDbContext context) : base(context) { }

        public List<Activity> GetActivities()
        {
            //here is a more low-level way of accessing the database. Leaving it here in case the DbContext gives you grief.
            /*
            List<Activity> activities= new List<Activity>();
            connection.Open();

            SqlCommand sqlCommand = new SqlCommand("Select * from Activities", connection);

            SqlDataReader reader = sqlCommand.ExecuteReader();
            while (reader.Read()) {
                activities.Add(new Activity { 
                    Act_ID = (int)reader.GetValue(0), 
                    Act_Name = (string)reader.GetValue(1), 
                    Act_Description = (string)reader.GetValue(2) });
            }

            connection.Close();
            return activities;*/



            return _context.Activities.ToList();
        }

        //searches the names of the activities for a term
        public List<Activity> SearchActivities(String ToSearch)
        {
            return _context.Activities.Where(a => a.Act_Name.Contains(ToSearch)).ToList();

            //other methods to make complex queries: .OrderBy() .GroupBy() .Join() .Select()
            // you can also do raw sql eg
            // _context.activities.FromSqlRaw("Select * From Activities WHERE Act_Name LIKE '%" + ToSearch + "%'").ToList<>;
        }
    }
}
