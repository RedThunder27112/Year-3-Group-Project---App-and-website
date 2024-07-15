using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Formatting the queries in their own classes instead of inside the controllers.
    //the queries should be used by the controllers to access the database  - Gage
    public abstract class AbstractQuery
    {
        //the connection to the database. Used for low-level accessing of the database, if the DbContext isn't working for you.
        //Currently not being used - Gage
        protected SqlConnection connection = new SqlConnection("Data Source=(LocalDB)\\MSSQLLocalDB;AttachDbFilename=F:\\SchoolStorage\\Uni\\Year3\\team18-dev\\Deliverable2\\LambdaPP_ProjectCore_D2\\LambdaPP_ProjectCore_D2\\Database\\LamdbdaPP_D2_Database.mdf;Integrated Security=True");
        
        //the DbContext is very important for running all the queries.
        protected MyDbContext _context;
        public AbstractQuery(MyDbContext context)
        {
            _context = context;
        }
    }
}
