using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LambdaPP_WebAPI_Alpha.Database;
using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.AspNetCore.Cors;
using System.Text.Json.Serialization;
using System.Text.Json;
using LamdbdaPP_WebAPI_D3.Database.Models;
using Microsoft.AspNetCore.StaticFiles;
using LambdaPP_WebAPI_Alpha.Helpers;
using LambdaPP_WebAPI_Alpha.Database.Queries;
using Microsoft.IdentityModel.Tokens;
using System.Collections;
using System.Diagnostics.CodeAnalysis;
using Microsoft.ML.Transforms;

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class ReportsController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly int COMPLETE_STATUS_ID = 2;

        public ReportsController(MyDbContext context)
        {
            _context = context;
        }



        // GET: Tasks/inProgressToday
        [HttpGet("inProgressToday")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksToday()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var currentDate = DateTime.Today;
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(
                    t => t.Task_Deadline >= currentDate && t.Task_Date_Started <= currentDate && t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        // GET: Tasks/completedToday
        [HttpGet("completedToday")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetCompletedTasksToday()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var currentDate = DateTime.Today;
            //hmm... this is actually more like "tasks that are active today that are already complete" - not checking if the "completed" status was assigned today.
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(
                t => t.Task_Deadline >= currentDate && t.Task_Date_Started <= currentDate && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        // GET: Tasks/ofStatusToday
        [HttpGet("ofStatusToday/{statusID}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetCompletedTasksToday(int statusID)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var currentDate = DateTime.Today;
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline >= currentDate && t.Task_Date_Started <= currentDate && t.Task_Enabled && t.Status_ID == statusID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        // GET: Tasks/DueToday
        [HttpGet("DueToday")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksDueToday()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var currentDate = DateTime.Today;
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline == currentDate && t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        // GET: Tasks/overdueToday
        [HttpGet("overdueToday")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksOverdueToday()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var currentDate = DateTime.Today;
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline < currentDate && t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }

        //- Number of overdue tasks: 
        //   + that were completed past due date
        [HttpGet("CompletedOverDueDate")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksCompletedAfterDueDate()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where
                (t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        //   + tasks that were completed after due date since a given date, so we can see eg over the past month
        [HttpPost("CompletedOverDueDateSince")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksCompletedAfterDueDate(DateTime sinceDate)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where(
                t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && sinceDate <= t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        //   + tasks that were completed after due date in a range
        [HttpPost("CompletedOverDueDateInRange")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksCompletedAfterDueDate(DateTime DateRangeStart, DateTime DateRangeEnd)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where(
                t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && DateRangeStart <= t.Task_Updates.Max(update => update.Update_Time) 
                && DateRangeEnd >= t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }


        //   + comparing overdue tasks between 2 timeperiods, eg so we can say "overdue tasks this month down by 50% from the previous month" or whatever
        [HttpPost("CompletedOverDueDateComparisonBetweenDateRanges")]
        public async Task<ActionResult<int>> GetTasksCompletedAfterDueDate(DateTime DateRange1Start, DateTime DateRange1End, DateTime DateRange2Start, DateTime DateRange2End)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            int NumOverdueTasksInRange1 = await _context.Tasks.Include(t => t.Task_Updates).Where(
                t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && DateRange1Start <= t.Task_Updates.Max(update => update.Update_Time) &&
                DateRange1End >= t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID).CountAsync();
            int NumOverdueTasksInRange2 = await _context.Tasks.Include(t => t.Task_Updates).Where(
                t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && DateRange2Start <= t.Task_Updates.Max(update => update.Update_Time) && 
                DateRange2End >= t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID).CountAsync();


            return (NumOverdueTasksInRange2 / NumOverdueTasksInRange1) * 100;
        }
        //   + all of that per activity?

        //- Per user:
        // GET: Tasks/DueToday
        [HttpGet("DueToday/ForUser/{userID}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksDueToday(int userID)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var currentDate = DateTime.Today;
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline == currentDate && t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID
             && t.Task_Employee_Bridges.Where(bridge => bridge.Emp_ID == userID).Count() != 0)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        //  + number of tasks they partook in that went over due date
        [HttpGet("CompletedOverDueDate/ForUser/{userID}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksCompletedAfterDueDate(int userID)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where
                (t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID 
                && t.Task_Employee_Bridges.Where(bridge => bridge.Emp_ID==userID).Count() != 0)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        [HttpGet("CompletedEarly/ForUser/{userID}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksCompletedEarly(int userID)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where
                (t => t.Task_Deadline > t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID
                && t.Task_Employee_Bridges.Where(bridge => bridge.Emp_ID == userID).Count() != 0)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        //  + ^ but after a given date only
        [HttpPost("CompletedOverDueDateSince/ForUser/{userID}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksCompletedAfterDueDate(int userID, DateTime sinceDate)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where
                (t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && sinceDate <= t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID 
                && t.Task_Employee_Bridges.Where(bridge => bridge.Emp_ID == userID && bridge.IsSupervisor).Count() != 0)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        
        //  + ^ but only where they were the supervisor
        [HttpPost("CompletedOverDueDateSince/ForSupervisor/{userID}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksSupervisedCompletedAfterDueDate(int userID, DateTime sinceDate)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //get tasks where the deadline is before the last update
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Include(t => t.Task_Updates).Where
                (t => t.Task_Deadline < t.Task_Updates.Max(update => update.Update_Time) && sinceDate <= t.Task_Updates.Max(update => update.Update_Time) && t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID
                && t.Task_Employee_Bridges.Where(bridge => bridge.Emp_ID == userID).Count() != 0)
                .Include(u => u.status).Include(t => t.activity).ToListAsync());
        }


        //  + average of when they complete tasks compared to due date, eg "this user usually completes tasks 1 day before / 2 days after deadline"
        [HttpGet("{empID}/completetasksDaysFromDueDate")]
        public async Task<ActionResult<int>> CompleteTasksDaysFromDueDateForEmployee(int empID)
        {
            int avgDateVariation = 0;

            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                 .Include(b => b.task.activity).Where(b => b.Emp_ID == empID).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID);

            foreach(Database.Models.Task t in tasks)
            {
                var mostRecentUpdate = (new TaskQuery(_context)).mostRecentUpdate((int)t.Task_ID);
                if (mostRecentUpdate == null) continue;
                DateTime latestUpdateDate = mostRecentUpdate.Update_Time;
                //a bug here would be for tasks over new years, this would glitch out, but idk if that will really ever happen.
                int dateVariation = t.Task_Deadline.Value.DayOfYear - latestUpdateDate.DayOfYear;
                avgDateVariation += dateVariation;
            }
            avgDateVariation = avgDateVariation / tasks.Count();

            return avgDateVariation;
        }

        //  + average of when they complete tasks compared to due date, for all employees eg "tasks usually completed x days after due date"
        [HttpGet("completetasksDaysFromDueDate")]
        public async Task<ActionResult<int>> CompleteTasksDaysFromDueDate()
        {
            int avgDateVariation = 0;

            var tasks = await _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID).ToListAsync();

            foreach (Database.Models.Task t in tasks)
            {
                var mostRecentUpdate = (new TaskQuery(_context)).mostRecentUpdate((int)t.Task_ID);
                if (mostRecentUpdate == null) continue;
                DateTime latestUpdateDate = mostRecentUpdate.Update_Time;
                //a bug here would be for tasks over new years, this would glitch out, but idk if that will really ever happen.
                int dateVariation = t.Task_Deadline.Value.DayOfYear - latestUpdateDate.DayOfYear;
                avgDateVariation += dateVariation;
            }
            avgDateVariation = avgDateVariation / tasks.Count();

            return avgDateVariation;
        }


        // new reviews that are way less than the employee's average
        [HttpGet("FarBelowAverageReviewsThisWeek")]
        public async Task<ActionResult<IEnumerable<Rating>>> newFarBelowAverageReviews()
        {
            

            var ratings = await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7)).ToListAsync();

            List<Rating> belowAverageRatings = new List<Rating>();

            foreach (Rating r in ratings)
            {
                double employeeRating = (await new EmployeesController(_context).GetEmployeeRating(r.Emp_ID)).Value;
                //if the rating is 3 points less than the employee average, it's noteworthy
                if (r.Rating_Rating < (employeeRating-3))
                    belowAverageRatings.Add(r); 
            }
            return belowAverageRatings;
        }
        // new reviews that are way less than the employee's average
        [HttpGet("BelowAverageReviewsThisWeek")]
        public async Task<ActionResult<IEnumerable<Rating>>> newBelowAverageReviews()
        {
            var ratings = await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7)).ToListAsync();

            List<Rating> belowAverageRatings = new List<Rating>();

            foreach (Rating r in ratings)
            {
                double employeeRating = (await new EmployeesController(_context).GetEmployeeRating(r.Emp_ID)).Value;
                if (r.Rating_Rating < (employeeRating))
                    belowAverageRatings.Add(r);
            }
            return belowAverageRatings;
        }
        // new reviews that are way less than the employee's average
        [HttpGet("oneStarReviewsThisWeek")]
        public async Task<ActionResult<IEnumerable<Rating>>> newOneStarReviews()
        {
            return await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7) && r.Rating_Rating==1).ToListAsync();

        }
        // new reviews that are way less than the employee's average
        [HttpGet("FiveStarReviewsThisWeek")]
        public async Task<ActionResult<IEnumerable<Rating>>> newFiveStarReviews()
        {
            return await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7) && r.Rating_Rating == 5).ToListAsync();
        }

        [HttpGet("TopRatedEmployeesThisWeek")]
        public async Task<ActionResult<IEnumerable<Employee>>> TopRatedEmployeesThisWeek()
        {
            var emps = await _context.Employees.Where(e => e.Emp_Enabled).ToListAsync();

            PriorityQueue<Employee,double> pq = new PriorityQueue<Employee,Double>();
            if (emps == null) return NotFound();
            foreach (Employee e in emps)
            {
                var ratings = await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7)).ToListAsync();
                //if the employee wasn't rated at all this week, just don't include them
                if (ratings.IsNullOrEmpty()) continue;

                double ratingThisWeek = ratings.Average(r => r.Rating_Rating);
                pq.Enqueue(e, -ratingThisWeek); //negative means lowest ratings become "highest" ratings aka lowest priority
            }

            List<Employee> toReturn = new List<Employee>();
            for(int i = 0; i < 5; i++)
            {
                if (pq.Count > 0)
                    toReturn.Add(pq.Dequeue());
                else
                    break;
            }

            return toReturn;
        }

        [HttpGet("LowestRatedEmployeesThisWeek")]
        public async Task<ActionResult<IEnumerable<Employee>>> LowestRatedEmployeesThisWeek()
        {
            var emps = await _context.Employees.Where(e => e.Emp_Enabled).ToListAsync();

            PriorityQueue<Employee, double> pq = new PriorityQueue<Employee, Double>();
            if (emps == null) return NotFound();
            foreach (Employee e in emps)
            {
                var ratings = await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7)).ToListAsync();
                //if the employee wasn't rated at all this week, just don't include them
                if (ratings.IsNullOrEmpty()) continue;
                
                double ratingThisWeek = ratings.Average(r => r.Rating_Rating);
                pq.Enqueue(e, ratingThisWeek);
            }

            List<Employee> toReturn = new List<Employee>();
            for (int i = 0; i < 5; i++)
            {
                if (pq.Count > 0)
                    toReturn.Add(pq.Dequeue());
                else
                    break;
            }

            return toReturn;
        }

        [HttpGet("{empID}/AvgRatingThisWeek")]
        public async Task<ActionResult<double>> AvgRatingThisWeek(int empID)
        {
            var emp = await _context.Employees.Where(e => e.Emp_Enabled && e.Emp_ID == empID).FirstOrDefaultAsync();

            if (emp == null) return NotFound();
            var ratings = await _context.Ratings.Where(r => r.Rating_Date > DateTime.Today.AddDays(-7)).ToListAsync();
            if (ratings.IsNullOrEmpty()) return -1;
            return ratings.Average(r => r.Rating_Rating);

        }


        //reports to add for the dashboard
        //stock used today
        //equipment currently in use right now
        //most recently completed task?
        //latest update?
        //tasks per activity in a given timeframe
        //tasks per month over the past year for a given activity
        //tasks that do not have enough employees/ have skills but no employees have the skill
        // new reviews that are way less than the employee's average
        [HttpGet("TasksWithSkillRequiredButNoMemberHasSkill")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> TasksWithSkillRequiredButNoMemberHasSkill()
        {
            var tasks =  await _context.Tasks.Where(t => t.Status_ID != COMPLETE_STATUS_ID).ToListAsync();
            List<Database.Models.Task> tasksWithSkillRequiredButNoMemberHasSkill = new List<Database.Models.Task>();
            foreach(Database.Models.Task t in tasks)
            {
                t.Employees = (await (new TasksController(_context).GetTaskEmployees((int)t.Task_ID))).Value.ToList();
                bool LacksEmployeeForASkill = false;
                List<Skill> skills = await _context.Task_Skill_Bridges.Where(s => s.Task_ID == t.Task_ID).Include(s => s.skill).Select(s => s.skill).ToListAsync();
                foreach(Skill skill in skills)
                {
                    if (!anEmployeeHasSkill(skill, t.Employees))
                    {
                        t.Employees = null;
                        t.Task_Employee_Bridges = null;
                        tasksWithSkillRequiredButNoMemberHasSkill.Add(t);
                        break; //finish with going through the skills, move onto the next task
                    }
                }


            }

            return tasksWithSkillRequiredButNoMemberHasSkill;
        }

        [HttpGet("TasksWithSkillRequiredButNoMemberHasSkill/{id}/MissingSkills")]
        public async Task<ActionResult<IEnumerable<Skill>>> TasksWithSkillRequiredButNoMemberHasSkill(int id)
        {
            var task = await _context.Tasks.Where(t => t.Task_ID == id).FirstOrDefaultAsync();
            task.Employees = (await (new TasksController(_context).GetTaskEmployees(id))).Value.ToList();

            List<Skill> taskSkills = await _context.Task_Skill_Bridges.Where(s => s.Task_ID == task.Task_ID).Include(s => s.skill).Select(s => s.skill).ToListAsync();
            List<Skill> missingSkills = new List<Skill>();
            foreach (Skill skill in taskSkills)
            {
                if (!anEmployeeHasSkill(skill, task.Employees))
                {
                    missingSkills.Add(skill);
                }
            }


            return missingSkills;
        }

        private bool anEmployeeHasSkill(Skill skill, List<Employee>? employees)
        {
            if (employees==null) return false;

            foreach(Employee e in employees)
            {
                if (e.Emp_ID == null) continue;
                var employeeSkills = new EmployeesController(_context).GetEmployeeSkills((int)e.Emp_ID).Result.Value;
                //if any of the employee's skills is the skill, we can return true
                if (employeeSkills.Where(s => s.skill.Skill_ID == skill.Skill_ID).Any())
                    return true;
            }
            return false;
        }


        //other:
        //for an employee, the num tasks they've completed in the past week

        //ratings for a specific project
        [HttpGet("{empid}/ratingsFor/{taskid}")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetRatingsForTask(int empid, int taskid)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            return await _context.Ratings.Where(r => r.Emp_ID == empid && r.Task_ID == taskid).ToListAsync();

            
        }

        //comments over the past 5 projects
        [HttpGet("{empid}/mostRecentProjectRatings/{numTasks}")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetPastProjectRatings(int empid, int numTasks)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            var Past5Projects = (new EmployeesController(_context).GetCompleteTasksForEmployee(empid)).Result.Value.OrderBy(t => t.Task_Deadline).TakeLast(numTasks).ToList();

            List<Rating> ratings = new List<Rating>();
            foreach (Database.Models.Task t in Past5Projects)
            {
                var RatingsForTask = _context.Ratings.Where(r => r.Task_ID == t.Task_ID && r.Emp_ID == empid).ToList();
                ratings.AddRange(RatingsForTask);
            }

            return ratings;
        }
        //average sentiment per month
        [HttpGet("{empid}/avgSentimentPerMonth")]
        public async Task<ActionResult<IEnumerable<double>>> GetAvgSentimentPerMonth(int empid)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            //initialise stock month list
            double[] AvgRatingPerMonth = new double[12];
            int[] RatingTotalPerMonth = new int[12];
            int[] RatingCountPerMonth = new int[12];
            for (int i = 0; i < 12; i++)
            {
                AvgRatingPerMonth[i] = 0;
                RatingTotalPerMonth[i] = 0;
                RatingCountPerMonth[i] = 0;
            }


            var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == empid && r.Rating_Category != null && r.Rating_Date.Year >= (DateTime.Now.Year - 1)).ToList();

            if (employeeRatings.Count > 0)
            {
                foreach (Rating r in employeeRatings)
                {
                    if (!DateLogicHelper.isOverAYearOld(r.Rating_Date))
                    {
                        //get the month, and record in the correct spot in the array
                        int month = r.Rating_Date.Month - 1;
                        RatingTotalPerMonth[month] += (int)r.Rating_Category;
                        RatingCountPerMonth[month]++;
                    }
                }
                for (int i = 0; i < 12; i++)
                {
                    if (RatingCountPerMonth[i] != 0)
                        AvgRatingPerMonth[i] = (double)RatingTotalPerMonth[i] / RatingCountPerMonth[i];
                }
            }
            return AvgRatingPerMonth;
        }
        //average rating per month
        [HttpGet("{empid}/avgRatingPerMonth")]
        public async Task<ActionResult<IEnumerable<double>>> GetAvgRatingPerMonth(int empid)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            //initialise stock month list
            double[] AvgRatingPerMonth = new double[12];
            int[] RatingTotalPerMonth = new int[12];
            int[] RatingCountPerMonth = new int[12];
            for (int i = 0; i < 12; i++)
            {
                AvgRatingPerMonth[i] = 0;
                RatingTotalPerMonth[i] = 0;
                RatingCountPerMonth[i] = 0;
            }
               

            var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == empid && r.Rating_Date.Year>=(DateTime.Now.Year-1)).ToList();

            if (employeeRatings.Count > 0)
            {
                foreach (Rating r in employeeRatings)
                {
                    if (!DateLogicHelper.isOverAYearOld(r.Rating_Date))
                    {
                        //get the month, and record in the correct spot in the array                
                        int month = r.Rating_Date.Month - 1;
                        RatingTotalPerMonth[month] += r.Rating_Rating;
                        RatingCountPerMonth[month]++;
                    }
                }
                for (int i = 0; i < 12; i++)
                {
                    if (RatingCountPerMonth[i] != 0)
                        AvgRatingPerMonth[i] = (double)RatingTotalPerMonth[i] / RatingCountPerMonth[i];
                }
            }
            return AvgRatingPerMonth;
        }

        //average rating per month
        [HttpGet("{empid}/avgRatingPerMonth/forActivity/{actID}")]
        public async Task<ActionResult<IEnumerable<double>>> GetAvgRatingPerMonth(int empid, int actID)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            //initialise stock month list
            double[] AvgRatingPerMonth = new double[12];
            int[] RatingTotalPerMonth = new int[12];
            int[] RatingCountPerMonth = new int[12];
            for (int i = 0; i < 12; i++)
            {
                AvgRatingPerMonth[i] = 0;
                RatingTotalPerMonth[i] = 0;
                RatingCountPerMonth[i] = 0;
            }


            var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == empid && r.Rating_Date.Year >= (DateTime.Now.Year - 1)).ToList();

            if (employeeRatings.Count > 0)
            {
                foreach (Rating r in employeeRatings)
                {
                    if (!DateLogicHelper.isOverAYearOld(r.Rating_Date))
                    {
                        var task = _context.Tasks.Find(r.Task_ID);
                        if (task!=null && task.Act_ID==actID)
                        {
                            //get the month, and record in the correct spot in the array                
                            int month = r.Rating_Date.Month - 1;
                            RatingTotalPerMonth[month] += r.Rating_Rating;
                            RatingCountPerMonth[month]++;
                        }
                      
                    }
                }
                for (int i = 0; i < 12; i++)
                {
                    if (RatingCountPerMonth[i] != 0)
                        AvgRatingPerMonth[i] = (double)RatingTotalPerMonth[i] / RatingCountPerMonth[i];
                }
            }
            return AvgRatingPerMonth;
        }

        //average overall rating per month for activity
        [HttpGet("avgOverallRatingPerMonth/forActivity/{actID}")]
        public async Task<ActionResult<IEnumerable<double>>> GetAvgOverallRatingPerMonth(int actID)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            //initialise stock month list
            double[] AvgRatingPerMonth = new double[12];
            int[] RatingTotalPerMonth = new int[12];
            int[] RatingCountPerMonth = new int[12];

            for (int i = 0; i < 12; i++)
            {
                AvgRatingPerMonth[i] = 0;
                RatingTotalPerMonth[i] = 0;
                RatingCountPerMonth[i] = 0;
            }

            var employees = _context.Employees.Where(r => r.Emp_Enabled == true).ToList();

            foreach (Employee e in employees)
            {

                var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == e.Emp_ID && r.Rating_Date.Year >= (DateTime.Now.Year - 1)).ToList();

                if (employeeRatings.Count > 0)
                {
                    foreach (Rating r in employeeRatings)
                    {

                        var task = _context.Tasks.Find(r.Task_ID);
                        if (task != null && task.Act_ID == actID)
                         {
                             //get the month, and record in the correct spot in the array                
                             int month = r.Rating_Date.Month - 1;
                             RatingTotalPerMonth[month] += r.Rating_Rating;
                             RatingCountPerMonth[month]++;
                        }

                        
                    }
                    for (int i = 0; i < 12; i++)
                    {
                        if (RatingCountPerMonth[i] != 0)
                            AvgRatingPerMonth[i] += (double)RatingTotalPerMonth[i] / RatingCountPerMonth[i];
                    }
                }

            }

            for (int i = 0; i < 12; i++)
            {
                if (RatingCountPerMonth[i] != 0)
                    AvgRatingPerMonth[i] = (double)AvgRatingPerMonth[i] / employees.Count;
            }


            return AvgRatingPerMonth;
        }


        //average rating per month
        [HttpGet("avgOverallRatingPerMonth")]
        public async Task<ActionResult<IEnumerable<double>>> GetOverallAvgRatingPerMonth()
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            //initialise stock month list
            double[] AvgRatingPerMonth = new double[12];
            int[] RatingTotalPerMonth = new int[12];
            int[] RatingCountPerMonth = new int[12];
            
            for (int i = 0; i < 12; i++)
            {
                AvgRatingPerMonth[i] = 0;
                RatingTotalPerMonth[i] = 0;
                RatingCountPerMonth[i] = 0;
            }

            var employees = _context.Employees.Where(r => r.Emp_Enabled == true).ToList();

            foreach (Employee e in employees)
            {

                var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == e.Emp_ID && r.Rating_Date.Year >= (DateTime.Now.Year - 1)).ToList();

                if (employeeRatings.Count > 0)
                {
                    foreach (Rating r in employeeRatings)
                    {
                        if (!DateLogicHelper.isOverAYearOld(r.Rating_Date))
                        {
                            //get the month, and record in the correct spot in the array                
                            int month = r.Rating_Date.Month - 1;
                            RatingTotalPerMonth[month] += r.Rating_Rating;
                            RatingCountPerMonth[month]++;
                        }
                    }
                    for (int i = 0; i < 12; i++)
                    {
                        if (RatingCountPerMonth[i] != 0)
                            AvgRatingPerMonth[i] += (double)RatingTotalPerMonth[i] / RatingCountPerMonth[i];
                    }
                }

            }

            for (int i = 0; i < 12; i++)
            {
                if (RatingCountPerMonth[i] != 0)
                    AvgRatingPerMonth[i] = (double)AvgRatingPerMonth[i] / employees.Count;
            }


            return AvgRatingPerMonth;
        }

        
        //most common comment, most common positive comment, most common negative comment
        [HttpGet("{empid}/mostCommonComment")]
        public async Task<ActionResult<KeyValuePair<int, string>>> GetMostCommonComment(int empid)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == empid && r.Rating_Comment != null && r.Rating_Comment != "").ToList();
            List<KeyValuePair<int, string>> comments = new List<KeyValuePair<int, string>>();
            

            if (employeeRatings.Count > 0)
            {
                foreach (Rating r in employeeRatings)
                {
                    var commentAsPair = new KeyValuePair<int, string>(1, r.Rating_Comment.ToLowerInvariant());
                    var comparer = new commentListComparer();
                    //if the comment is contained in there, add one to the key aka count
                    if (comments.Contains(commentAsPair, comparer))
                    {
                        var comment = comments.Where(c => c.Value.Equals(commentAsPair.Value)).FirstOrDefault();
                        var newComment = new KeyValuePair<int, string>(comment.Key+1, r.Rating_Comment);
                        comments.Remove(comment);
                        comments.Add(newComment);
                    }
                    else
                    {
                        comments.Add(commentAsPair);
                    }

                }
                return comments.MaxBy(c => c.Key);
            }
            return null;
        }
        [HttpGet("{empid}/mostCommonPositiveComment")]
        public async Task<ActionResult<KeyValuePair<int, string>>> GetMostCommonPositiveComment(int empid)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == empid && r.Rating_Comment != null && r.Rating_Comment != "" && r.Rating_Category==1).ToList();
            List<KeyValuePair<int, string>> comments = new List<KeyValuePair<int, string>>();


            if (employeeRatings.Count > 0)
            {
                foreach (Rating r in employeeRatings)
                {
                    var commentAsPair = new KeyValuePair<int, string>(1, r.Rating_Comment.ToLowerInvariant());
                    var comparer = new commentListComparer();
                    //if the comment is contained in there, add one to the key aka count
                    if (comments.Contains(commentAsPair, comparer))
                    {
                        var comment = comments.Where(c => c.Value.Equals(commentAsPair.Value)).FirstOrDefault();
                        var newComment = new KeyValuePair<int, string>(comment.Key + 1, r.Rating_Comment);
                        comments.Remove(comment);
                        comments.Add(newComment);
                    }
                    else
                    {
                        comments.Add(commentAsPair);
                    }

                }
                return comments.MaxBy(c => c.Key);
            }
            return null;
        }
        [HttpGet("{empid}/mostCommonNegativeComment")]
        public async Task<ActionResult<KeyValuePair<int, string>>> GetMostCommonNegativeComment(int empid)
        {
            if (_context.Ratings == null)
            {
                return NotFound();
            }

            var employeeRatings = _context.Ratings.Where(r => r.Emp_ID == empid && r.Rating_Comment != null && r.Rating_Comment != "" && r.Rating_Category == 3).ToList();
            List<KeyValuePair<int, string>> comments = new List<KeyValuePair<int, string>>();


            if (employeeRatings.Count > 0)
            {
                foreach (Rating r in employeeRatings)
                {
                    var commentAsPair = new KeyValuePair<int, string>(1, r.Rating_Comment.ToLowerInvariant());
                    var comparer = new commentListComparer();
                    //if the comment is contained in there, add one to the key aka count
                    if (comments.Contains(commentAsPair, comparer))
                    {
                        var comment = comments.Where(c => c.Value.Equals(commentAsPair.Value)).FirstOrDefault();
                        var newComment = new KeyValuePair<int, string>(comment.Key + 1, r.Rating_Comment);
                        comments.Remove(comment);
                        comments.Add(newComment);
                    }
                    else
                    {
                        comments.Add(commentAsPair);
                    }

                }
                return comments.MaxBy(c => c.Key);
            }
            return null;
        }

        //get the task avg completion date compared to deadline per months
        [HttpGet("AvgTaskCompletionDateRelativeToDeadlinePerMonth")]
        public async Task<ActionResult<IEnumerable<double>>> AvgTaskCompletionDateRelativeToDeadlinePerMonth()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }

            //initialise lists
            double[] AvgDateFromDeadlinePerMonth = new double[12];
            int[] DateFromDeadlineTotalPerMonth = new int[12];
            int[] TaskCountPerMonth = new int[12];

            for (int i = 0; i < 12; i++)
            {
                AvgDateFromDeadlinePerMonth[i] = 0;
                DateFromDeadlineTotalPerMonth[i] = 0;
                TaskCountPerMonth[i] = 0;
            }

            var tasks = _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID==COMPLETE_STATUS_ID && t.Task_Deadline > DateTime.Today.AddDays(-365)).ToList();
            var tController = new TasksController(_context);
            foreach (Database.Models.Task t in tasks)
            {
                if (t.Task_Deadline != null)
                {
                    var latestUpdate = (await tController.GetLatestTaskUpdate((int)t.Task_ID)).Value;
                    if (latestUpdate != null)
                    {
                        int dateOfCompletion = (latestUpdate.Update_Time - (DateTime)t.Task_Deadline).Days;
                        int month = t.Task_Deadline.Value.Month - 1;
                        DateFromDeadlineTotalPerMonth[month] += dateOfCompletion;
                        TaskCountPerMonth[month]++;
                    }                
                }
            }
            for (int i = 0; i < 12; i++)
            {
                if (TaskCountPerMonth[i] != 0)
                    AvgDateFromDeadlinePerMonth[i] += (double)DateFromDeadlineTotalPerMonth[i] / TaskCountPerMonth[i];
            }

            return AvgDateFromDeadlinePerMonth;
        }


        [HttpGet("TaskCompletedPerMonth")]
        public async Task<ActionResult<IEnumerable<int>>> TasksCompletedPerMonth()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            int[] TaskCountPerMonth = new int[12];

            for (int i = 0; i < 12; i++)
                TaskCountPerMonth[i] = 0;

            var tasks = _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID && t.Task_Deadline > DateTime.Today.AddDays(-365)).ToList();
            var tController = new TasksController(_context);
            foreach (Database.Models.Task t in tasks)
            {
                if (t.Task_Deadline != null)
                {
                    int month = t.Task_Deadline.Value.Month - 1;
                    TaskCountPerMonth[month]++;
                }
            }
          
            return TaskCountPerMonth;
        }
        [HttpGet("TaskCompletedPerMonth/forActivity/{actID}")]
        public async Task<ActionResult<IEnumerable<int>>> TasksCompletedPerMonth(int actID)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            int[] TaskCountPerMonth = new int[12];

            for (int i = 0; i < 12; i++)
                TaskCountPerMonth[i] = 0;

            var tasks = _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID && t.Act_ID==actID
                                                && t.Task_Deadline > DateTime.Today.AddDays(-365)).ToList();
            var tController = new TasksController(_context);
            foreach (Database.Models.Task t in tasks)
            {
                if (t.Task_Deadline != null)
                {
                    int month = t.Task_Deadline.Value.Month - 1;
                    TaskCountPerMonth[month]++;
                }
            }

            return TaskCountPerMonth;
        }

        [HttpGet("TaskOverduePerMonth")]
        public async Task<ActionResult<IEnumerable<int>>> TasksOverduePerMonth()
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            int[] TaskCountPerMonth = new int[12];

            for (int i = 0; i < 12; i++)
                TaskCountPerMonth[i] = 0;

            var tasks = _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID && t.Task_Deadline > DateTime.Today.AddDays(-365)).ToList();
            var tController = new TasksController(_context);
            foreach (Database.Models.Task t in tasks)
            {
                if (t.Task_Deadline != null)
                {
                    var latestUpdate = (await tController.GetLatestTaskUpdate((int)t.Task_ID)).Value;
                    if (latestUpdate != null)
                    {
                        int dateOfCompletion = (latestUpdate.Update_Time - (DateTime)t.Task_Deadline).Days;
                        if (dateOfCompletion > 0)// if last update is after deadline, was finished late
                        {
                            int month = t.Task_Deadline.Value.Month - 1;
                            TaskCountPerMonth[month]++;
                        }
                       
                    }
                }
            }
           
            return TaskCountPerMonth;
        }
        [HttpGet("TaskOverduePerMonth/forActivity/{actID}")]
        public async Task<ActionResult<IEnumerable<int>>> TasksOverduePerMonth(int actID)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            int[] TaskCountPerMonth = new int[12];

            for (int i = 0; i < 12; i++)
                TaskCountPerMonth[i] = 0;

            var tasks = _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID && t.Act_ID==actID
                                               && t.Task_Deadline > DateTime.Today.AddDays(-365)).ToList();
            var tController = new TasksController(_context);
            foreach (Database.Models.Task t in tasks)
            {
                if (t.Task_Deadline != null)
                {
                    var latestUpdate = (await tController.GetLatestTaskUpdate((int)t.Task_ID)).Value;
                    if (latestUpdate != null)
                    {
                        int dateOfCompletion = (latestUpdate.Update_Time - (DateTime)t.Task_Deadline).Days;
                        if (dateOfCompletion > 0)// if last update is after deadline, was finished late
                        {
                            int month = t.Task_Deadline.Value.Month - 1;
                            TaskCountPerMonth[month]++;
                        }

                    }
                }
            }

            return TaskCountPerMonth;
        }

    }


    internal class commentListComparer : IEqualityComparer<KeyValuePair<int, string>>
    {
        public bool Equals(KeyValuePair<int, string> x, KeyValuePair<int, string> y)
        {
            if (x.Value == y.Value) return true;
            return false;
        }

        public int GetHashCode([DisallowNull] KeyValuePair<int, string> obj)
        {
            return obj.Value.GetHashCode();
        }
    }
}
