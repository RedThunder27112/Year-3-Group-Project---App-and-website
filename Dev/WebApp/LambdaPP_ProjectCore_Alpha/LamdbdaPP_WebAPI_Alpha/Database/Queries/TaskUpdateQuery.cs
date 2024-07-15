using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Task_Updates" table
    public class TaskUpdateQuery : AbstractQuery
    {
        //calls base constructor
        public TaskUpdateQuery(MyDbContext context) : base(context) { }

        public List<Task_Update> GetTaskUpdates()
        {
            return _context.Task_Updates.ToList();
        }

        public Task_Update GetTaskUpdateFromID(int id)
        {
            var s = _context.Task_Updates.Where(a => a.Update_ID.Equals(id)).FirstOrDefault();
            return s;
        }


        //other methods needed:

        //edit task update
        //add task update
        //delete update
        //get updates of a specific task
        //get updates posted by a specific employee

    }
}
