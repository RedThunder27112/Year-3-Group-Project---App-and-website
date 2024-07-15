using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Task" table
    public class TaskQuery : AbstractQuery
    {
        //calls base constructor
        public TaskQuery(MyDbContext context) : base(context) { }

        public List<Models.Task> GetTasks()
        {
            return _context.Tasks.ToList();
        }

        //searches the names of the Tasks for a term
        public List<Models.Task> SearchTasks(String ToSearch)
        {
            return _context.Tasks.Where(a => a.Task_Name.Contains(ToSearch)).ToList();
        }

        public Task_Update? mostRecentUpdate(int task_ID)
        {
            if (_context.Tasks == null)
            {
                return null;
            }
            if (_context.Task_Updates.Where(t => t.Task_ID == task_ID).ToList().IsNullOrEmpty())
                return null;

            //DateTime maxDate = _context.Task_Updates.Where(t => t.Task_ID == task_ID).Max(t => t.Update_Time);
            //return _context.Task_Updates.Where(t => t.Task_ID == task_ID && t.Update_Time == maxDate).FirstOrDefault();
            return _context.Task_Updates.Where(t => t.Task_ID == task_ID).OrderByDescending(t => t.Update_Time).FirstOrDefault();
        }

        //other methods needed:

        //get task Status name
        //get task updates
        //get task activity
        //get task employees
        //get task equipment
        //get task stock
        //edit task
        //delete task

    }
}
