using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Task_Statuses" table
    public class TaskStatusQuery : AbstractQuery
    {
        //calls base constructor
        public TaskStatusQuery(MyDbContext context) : base(context) { }

        public List<Task_Status> GetStatuses()
        {
            return _context.TaskStatuses.ToList();
        }


        //other methods needed:


        //get status name from iD
        public string SearchStatus(int id)
        {
            var s = _context.TaskStatuses.Where(a => a.Status_ID.Equals(id)).FirstOrDefault();
            return s.Status_Name;
        }

        //add status
        public int addSkill(Task_Status taskStatus)//not tested if works yet - did not make this async. Is that needed?
        {
            //var s = _context.TaskStatuses.Where(a => a.Status_ID.Equals(id)).FirstOrDefault();

            try
            {
                _context.TaskStatuses.Add(taskStatus);
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }


        //delete status

        public bool deleteStatus(int id)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.TaskStatuses.Where(a => a.Status_ID.Equals(id)).FirstOrDefault();

            try
            {
                _context.Remove(s);
                _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return false;
            }
        }

        //edit status
        public int editStatus(Task_Status taskStatus)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.TaskStatuses.Where(a => a.Status_ID.Equals(taskStatus.Status_ID)).FirstOrDefault();

            s.Status_Name = taskStatus.Status_Name;

            try
            {
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }

    }
}
