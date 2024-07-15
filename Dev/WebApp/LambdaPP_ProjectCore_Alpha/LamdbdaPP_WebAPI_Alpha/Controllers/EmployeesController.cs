using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LambdaPP_WebAPI_Alpha.Database;
using LambdaPP_WebAPI_Alpha.Database.Models;
using LambdaPP_WebAPI_Alpha.Database.Queries;
using Microsoft.AspNetCore.Cors;
using System.Text.Json.Serialization;
using System.Text.Json;
using LamdbdaPP_WebAPI_D3.Helpers;
using LamdbdaPP_WebAPI_D3.Database.Models;
using Microsoft.Extensions.Hosting;
using System.Collections;
using System.Net.Mail;
using System.Net;
using LambdaPP_WebAPI_Alpha.Helpers;
using Microsoft.IdentityModel.Tokens;
using Azure.Core;

namespace LambdaPP_WebAPI_Alpha.Controllers
{

    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class EmployeesController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly int COMPLETE_STATUS_ID = 2;

        public EmployeesController(MyDbContext context)
        {
            _context = context;
        }

        // GET: all enabled Employees
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            if (_context.Employees == null)
            {
                return NotFound();
            }
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(await _context.Employees.Where(e => e.Emp_Enabled).ToListAsync());
        }

        // GET: Employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            if (_context.Employees == null)
            {
                return NotFound();
            }
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            employee.Emp_Password = null;
            return employee;
        }

        //Get all employee tasks
        [HttpGet("{id}/tasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetTasksForEmployee(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }

        //Get all employee tasks
        [HttpGet("{id}/tasks/supervised")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetSupervisedTasksForEmployee(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                .Include(b => b.task.activity).Where(b => b.Emp_ID == id && b.IsSupervisor).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }

        //get Incomplete tasks
        [HttpGet("{id}/incompletetasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetIncompleteTasksForEmployee(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                 .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }
        //get Incomplete tasks
        [HttpGet("{id}/upcomingtasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetUpcomingTasksForEmployee(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                 .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID && t.Task_Date_Started > DateTime.Today);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }

        //Get all employee tasks
        [HttpGet("{id}/incompletetasks/supervised")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetTasksEmployeeIsSupervising(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                .Include(b => b.task.activity).Where(b => b.Emp_ID == id && b.IsSupervisor).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }

        //Get all employee tasks
        [HttpGet("{id}/incompletetasks/inActivity/{actid}")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetTasksForEmployeeForActivity(int id, int actid)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID && t.Act_ID == actid);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }

        //get number of tasks each employee is busy with in a date range
        [HttpGet("numbusytasks")]
        public async Task<ActionResult<IEnumerable<Employee_Num_Busy?>>> GetNumBusyTasks([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (startDate == DateTime.MinValue) startDate = DateTime.Today;
            if (endDate == DateTime.MinValue) endDate = DateTime.Today;
            var empList = _context.Employees.Where(t => t.Emp_Enabled == true).ToList();

            List<Employee_Num_Busy> listBusy = new List<Employee_Num_Busy>();
            foreach (Employee e in empList)
            {
                var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Where(b => b.Emp_ID == e.Emp_ID).ToListAsync();
                var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID);

                Employee_Num_Busy busy = new Employee_Num_Busy();

                int count = 0;
                foreach(Database.Models.Task t in tasks)
                {
                    //the employee is busy with the task if:

                    //if the deadline is before the range started, can't be busy
                    if (t.Task_Deadline < startDate) continue;
                    //if the start date is after the range ends, can't be busy
                    if (t.Task_Date_Started >  endDate) continue;

                    //so the deadline is in the future and the start date is in the past, so we must be busy with the task sometime in between. So inc the busy count
                    count++;

                }
                busy.Num_Busy = count;
                //busy.Num_Busy = tasks.ToList().Count();
                busy.Emp_ID = e.Emp_ID;

                listBusy.Add(busy);

            }

            return listBusy;
        }

        //get employees alongside which tasks they will be busy with in a date range
        [HttpGet("busytasks")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetBusyTasks([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var empList = _context.Employees.Include(e => e.Task_Employee_Bridges).Where(e => e.Emp_Enabled == true).ToList();
            if (startDate == DateTime.MinValue) startDate = DateTime.Today;
            if (endDate == DateTime.MinValue) endDate = DateTime.Today;

            List<Employee> listBusy = new List<Employee>();
            foreach (Employee e in empList)
            {

                var busyTasks = new List<Database.Models.Task>();
                foreach (Task_Employee_Bridge teb in e.Task_Employee_Bridges)
                {
                    var task = _context.Tasks.Where(t => t.Task_ID == teb.Task_ID).FirstOrDefault();
                    if (task != null)
                        if (task.Status_ID != COMPLETE_STATUS_ID && task.Task_Enabled)
                        {
                            //the employee is busy with the task if:

                            //if the deadline is before the range started, can't be busy
                            if (task.Task_Deadline < startDate) continue;
                            //if the start date is after the range ends, can't be busy
                            if (task.Task_Date_Started > endDate) continue;

                            //so the deadline is in the future and the start date is in the past, so we must be busy with the task sometime in between. So inc the busy count
                            busyTasks.Add(HttpGetInfoCleaner.RemoveUnneededTaskInfo(task));
                        }
                }

                e.Tasks = busyTasks;
                e.Task_Employee_Bridges = null;
                listBusy.Add(e);

            }

            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(listBusy);
        }

        //get which tasks an employee will be busy with in a date range
        [HttpGet("{id}/busytasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetBusyTasks(int id, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (!EmployeeExists(id))
                return NotFound();
            if (startDate == DateTime.MinValue) startDate = DateTime.Today;
            if (endDate == DateTime.MinValue) endDate = DateTime.Today;

            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Where(b => b.Emp_ID == id).ToListAsync();

            var busyTasks = new List<Database.Models.Task>();

            foreach (Task_Employee_Bridge teb in bridges)
            {
                var task = teb.task;
                if (task != null)
                    if (task.Status_ID != COMPLETE_STATUS_ID && task.Task_Enabled)
                    {
                        //the employee is busy with the task if:

                        //if the deadline is before the range started, can't be busy
                        if (task.Task_Deadline < startDate)
                        {
                            //task deadline is in the future but before the start date so they'll finish before time
                            if (task.Task_Deadline >= DateTime.Today) continue;
                            //task deadline is in the past but not complete. Assume it'll finish today.
                            //if start date is today (or before), they're busy then!
                            if (startDate > DateTime.Today) continue;
                        }
                        //if the start date is after the range ends, can't be busy
                        if (task.Task_Date_Started > endDate) continue;

                        //so the deadline is in the future and the start date is in the past, so we must be busy with the task sometime in between. So inc the busy count
                        busyTasks.Add(HttpGetInfoCleaner.RemoveUnneededTaskInfo(task));
                    }
            }


            return busyTasks;
        }

        //get num tasks an employee will be busy with in a date range
        [HttpGet("{id}/numBusytasks")]
        public async Task<ActionResult<int>> GetNumBusyTasks(int id, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (!EmployeeExists(id))
                return NotFound();

            if (startDate == DateTime.MinValue) startDate = DateTime.Today;
            if (endDate == DateTime.MinValue) endDate = DateTime.Today;

            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Where(b => b.Emp_ID == id).ToListAsync();

            int count = 0;
            foreach (Task_Employee_Bridge teb in bridges)
            {
                var task = teb.task;
                if (task != null)
                    if (task.Status_ID != COMPLETE_STATUS_ID && task.Task_Enabled)
                    {
                        //the employee is busy with the task if:

                        //if the deadline is before the range started, SHOULD be done the task.
                        //how do we tell if ACTUALLY done? if the deadline is still in the future but before the start of the range the employee should be done by then.
                        //if the deadline is in the past now, it's overdue and no guarantee when it'll finish - can assume it'll finish today 
                        if (task.Task_Deadline < startDate)
                        {
                            //use this function for tasks we should be done
                            continue;
                            //task deadline is in the future but before the start date so they'll finish before time
                            if (task.Task_Deadline >= DateTime.Today) continue;
                            //task deadline is in the past but not complete. Assume it'll finish today.
                            //if start date is today (or before), they're busy then!
                            if (startDate > DateTime.Today) continue;
                        }
                       
                        
                        
                        //if the start date is after the range ends, can't be busy
                        if (task.Task_Date_Started > endDate) continue;

                        //so the deadline is in the future and the start date is in the past, so we must be busy with the task sometime in between. So inc the busy count
                        count++;
                    }
            }

            return count;
        }

        //get Complete tasks
        [HttpGet("{id}/completetasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetCompleteTasksForEmployee(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                 .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var tasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID == COMPLETE_STATUS_ID);

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }

        //get Latest updated tasks
        [HttpGet("{id}/lastUpdatedTasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetLastUpdatedTasksForEmployee(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                 .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var incompleteTasks = bridges.Select(b => b.task).Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID);

            TaskQuery taskQuery = new TaskQuery(_context);
            //List<(Database.Models.Task, DateTime)> tasksWithLatestUpdateDate = new List<(Database.Models.Task, DateTime)>();
            SortedList<DateTime, Database.Models.Task> tasksWithLatestUpdateDate = new SortedList<DateTime, Database.Models.Task>(new DuplicateKeyComparer<DateTime>());
            foreach (Database.Models.Task t in incompleteTasks)
            {
                int? taskID = t.Task_ID;
                if (taskID != null)
                {
                    Task_Update? task_Update = taskQuery.mostRecentUpdate(taskID.GetValueOrDefault());
                    //tasksWithLatestUpdateDate.Add((t,task_Update))
                    if (task_Update != null)
                        tasksWithLatestUpdateDate.Add(task_Update.Update_Time, t);
                    else
                        tasksWithLatestUpdateDate.Add(DateTime.MaxValue, t);
                }
            }
            List<KeyValuePair<DateTime, Database.Models.Task>> DescendingTasks = tasksWithLatestUpdateDate.OrderByDescending(x => x.Key).ToList();
            List<Database.Models.Task?> tasks = new List<Database.Models.Task?>();
            foreach (KeyValuePair<DateTime, Database.Models.Task> t in DescendingTasks)
                tasks.Add(t.Value);



            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }



        //get Rating for task

        [HttpGet("{id}/ratingsfortask")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetRatingsForEmployeeTask(int id, [FromQuery] int taskid)
        {
            if (_context.Employees == null)
            {
                return NotFound();
            }
            //this edit might not work, as i got rid of the bridging due to
            //it causing issues with adding new ratings
            List<Rating> listRating = await _context.Ratings.Where(b => b.Emp_ID == id && b.Task_ID == taskid).ToListAsync();

            return listRating;
            //var bridge = await _context.Task_Employee_Bridges.Where(b => b.Emp_ID == id && b.Task_ID == taskid).Include(b => b.Ratings).FirstOrDefaultAsync();
            //if (bridge == null || bridge.Ratings == null)
            //    return NotFound();
            //return bridge.Ratings;
        }

        [HttpGet("{id}/taskrated")]
        public async Task<ActionResult<int>> GetIfRated(int id, [FromQuery] int taskid)
        {
            if (_context.Employees == null)
            {
                return NotFound();
            }

            List<Rating> listRating = await _context.Ratings.Where(b => b.reviewer_ID == id && b.Task_ID == taskid).ToListAsync();

            if(listRating.IsNullOrEmpty())
            {
                return -1;
            }else
            {
                return 1;
            }
           

        }

        // GET: is an employee busy on a day
        [HttpGet("{id}/TasksOnDay")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksOn(int id, [FromQuery] DateTime date1)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
                .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(bridges.Select(b => b.task).Where(t => t.Task_Deadline >= date1 && t.Task_Date_Started < date1).ToList());
        }
        // GET: is an employee busy on a day
        [HttpGet("{id}/FreeOnDay")]
        public async Task<ActionResult<Boolean>> GetIsFreeOn(int id, [FromQuery] DateTime date1)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.task).Include(b => b.task.status)
               .Include(b => b.task.activity).Where(b => b.Emp_ID == id).ToListAsync();
            var isFree = bridges.Select(b => b.task).Where(t => t.Task_Deadline >= date1 && t.Task_Date_Started < date1).IsNullOrEmpty();
            return isFree;
        }
        // GET: the employees who are free on a day
        /*[HttpGet("FreeEmployees")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetFreeEmployeesOnDay([FromQuery] DateTime date1)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var freeEmployees = _context.Tasks.Where(t => t.Task_Deadline >= date1 && t.Task_Date_Started < date1).IsNullOrEmpty();
            return isFree;
        }*/

        //Get all employee skills
        [HttpGet("{id}/skills")]
        public async Task<ActionResult<IEnumerable<SkillWithLevel?>>> GetEmployeeSkills(int id)
        {
            var bridges = await _context.Employee_Skill_Bridges.Include(b => b.skill).Where(b => b.Emp_ID == id).ToListAsync();

            var SkillsWithLevels = new List<SkillWithLevel>();
            foreach (var b in bridges.ToList())
            {
                //ensure we don't pass more data than needed
                if (b.skill != null)
                    b.skill.Employee_Skill_Bridges = null;
                SkillsWithLevels.Add(new SkillWithLevel(b.skill, b.Skill_Level));
            }

            return SkillsWithLevels;
        }

        // GET: Employees/5
        [HttpGet]
        public Task<ActionResult<Employee>> GetEmployee([FromQuery] String Username, String Password)
        {
            EmployeeQuery query = new EmployeeQuery(_context);
            return query.Login(Username, Password);
        }

        //Get all employee skills
        [HttpGet("{id}/skillsNoLevel")]
        public async Task<ActionResult<IEnumerable<Skill>>> GetEmployeeSkillsNoLevel(int id)
        {
            List<Employee_Skill_Bridge> bridges = await _context.Employee_Skill_Bridges.Include(b => b.skill).Where(b => b.Emp_ID == id && b.ES_Enabled == true).ToListAsync();

            List<Skill> skillList = new List<Skill>();
            foreach(Employee_Skill_Bridge s in bridges.ToList()) 
            {
                var skill = _context.Skills.Where(b => b.Skill_ID == s.Skill_ID && b.Skill_Enabled == true).FirstOrDefault();

                if(skill != null)
                {
                    skillList.Add(skill);
                }

            }

            return skillList;
        }

        //Get all employee ratings
        [HttpGet("{id}/ratings")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetEmployeeRatings(int id)
        {
            return await _context.Ratings.Where(b => b.Emp_ID == id).ToListAsync();
        }

        //Get employee average rating
        [HttpGet("{id}/avgRating")]
        public async Task<ActionResult<Double>> GetEmployeeRating(int id)
        {
            return _context.Ratings.Where(b => b.Emp_ID == id).Average(r => r.Rating_Rating);
        }

        //Get count employee ratings
        [HttpGet("{id}/numRatings")]
        public async Task<ActionResult<int>> GetEmployeeRatingCount(int id)
        {
            return await _context.Ratings.Where(b => b.Emp_ID == id).CountAsync();
        }

        //Get employee ratings for an activity
        [HttpGet("{id}/ratingsForActivity/{actID}")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetEmployeeRatingsForActivity(int id, int actID)
        {
            var ratings = await _context.Ratings.Where(b => b.Emp_ID == id).ToListAsync();
            //should only be rated per task once

            List<Rating> ratingsForActivity = new List<Rating>();
            TasksController tasksController = new TasksController(_context);
            foreach (Rating r in ratings)
            {
                var task = await tasksController.GetTask(r.Task_ID);
                if (task != null && task.Value != null)
                    if (task.Value.Act_ID == actID)
                        ratingsForActivity.Add(r);
            }
            return ratingsForActivity;
        }

        //Get employee ratings for an activity
        [HttpGet("{id}/avgRatingForActivity/{actID}")]
        public async Task<ActionResult<Double>> GetEmployeeAvgRatingsForActivity(int id, int actID)
        {
            var ratings = await _context.Ratings.Where(b => b.Emp_ID == id).ToListAsync();
            //should only be rated per task once

            List<Rating> ratingsForActivity = new List<Rating>();
            TasksController tasksController = new TasksController(_context);
            foreach (Rating r in ratings)
            {
                var task = await tasksController.GetTask(r.Task_ID);
                if (task != null && task.Value != null)
                    if (task.Value.Act_ID == actID)
                        ratingsForActivity.Add(r);
            }
            if (ratingsForActivity.IsNullOrEmpty()) return 0;
            return ratingsForActivity.Average(r => r.Rating_Rating);
        }

        [HttpPost("skills")]
        public async Task<ActionResult<int>> PostEmployeeSkills([FromBody] List<Employee_Skill_Bridge> skills)
        {
            if (_context.Employee_Skill_Bridges == null)
            {
                return Problem("Entity set 'MyDbContext.Employee_Skill_Bridges'  is null.");
            }

            if (skills == null)
            {
                return Problem("No skills");
            }

            var currentSkills = _context.Employee_Skill_Bridges.Where(t => t.Emp_ID == skills[0].Emp_ID).ToList();

            foreach (Employee_Skill_Bridge r in skills)
            {
                var skillOld = _context.Employee_Skill_Bridges.Where(t => t.Emp_ID == r.Emp_ID && t.Skill_ID == r.Skill_ID).FirstOrDefault();

                if (skillOld == null)
                {
                    _context.Employee_Skill_Bridges.Add(r);
                }
                else
                {
                    skillOld.ES_Enabled = true;
                    //_context.Employee_Skill_Bridges.Update(skillOld);

                    currentSkills.Remove(skillOld);
                }


            }

            foreach (Employee_Skill_Bridge r in currentSkills)
            {
                var removeSkill = _context.Employee_Skill_Bridges.Where(t => t.Emp_ID == r.Emp_ID && t.Skill_ID == r.Skill_ID).FirstOrDefault();

                removeSkill.ES_Enabled = false;
                //_context.Employee_Skill_Bridges.Update(removeSkill);

            }

            await _context.SaveChangesAsync();

            return 0;
        }

        [HttpPost("dateChange")]
        public async Task<ActionResult<string>> PostDateChange()
        {

            var taskList = _context.Tasks.ToList();

            DateTime dateTime = DateTime.Now;
            int dateChange = 0;

            //update all tasks
            foreach (Database.Models.Task t in taskList)
            {
                Random random = new Random();
                dateChange = random.Next(1, 200);

                dateChange = dateChange * -1;


               
                t.Task_Date_Started = t.Task_Date_Started.AddDays(dateChange);
                t.Task_Deadline = t.Task_Deadline?.AddDays(dateChange);
                await _context.SaveChangesAsync();
                //update all task updates
                var taskUpdates = _context.Task_Updates.Where(u => u.Task_ID == t.Task_ID).ToList();
                foreach (Database.Models.Task_Update tu in taskUpdates)
                {
                    tu.Update_Time = tu.Update_Time.AddDays(dateChange);
                    await _context.SaveChangesAsync();

                }

                //update all task requests
                var taskRequests = _context.Task_Requests.Where(u => u.Task_ID == t.Task_ID).ToList();
                foreach (Database.Models.Task_Request tr in taskRequests)
                {
                   // if(!tr.Req_Date.Equals("0001/01/01"))
                    //{
                     //   tr.Req_Date = tr.Req_Date.AddDays(dateChange);
                      //  await _context.SaveChangesAsync();
                    //}
                  
                }

                //update all ratings
                var ratings = _context.Ratings.Where(u => u.Task_ID == t.Task_ID).ToList();
                foreach (Database.Models.Rating tu in ratings)
                {
                    tu.Rating_Date = tu.Rating_Date.AddDays(dateChange);
                    await _context.SaveChangesAsync();

                }

                //update all notifications
                var notifications = _context.Notification.Where(u => u.Task_ID == t.Task_ID).ToList();
                foreach (Database.Models.Notification tu in notifications)
                {
                    tu.Not_Date = tu.Not_Date.AddDays(dateChange);
                    await _context.SaveChangesAsync();

                }

                //update all feedback
                var feedback = _context.Feedback.Where(u => u.Task_ID == t.Task_ID).ToList();
                foreach (Database.Models.Feedback tu in feedback)
                {
                    tu.Feedback_Date = tu.Feedback_Date.AddDays(dateChange);
                    await _context.SaveChangesAsync();

                }




            }


            return "Prays";
        }

        [HttpPost("{id}/{skillLevel}/requestAddSkill")]
        public async Task<ActionResult<int>> PostEmployeeSkillRequest([FromBody] Skill skill, int id, int skillLevel)
        {
            if (_context.Request_Skill == null)
            {
                return Problem("Entity set 'MyDbContext.Employee_Skill_Bridges'  is null.");
            }

            if (skill == null)
            {
                return Problem("No skills");
            }

            Request_Skill request = new Request_Skill()
            {
                Req_Skill_Level = skillLevel,
                Emp_ID = id,
                Skill_ID = skill.Skill_ID,
                Req_Skill_Has_Doc = 0,
                Req_Skill_Approval_State = 0,
                Req_Skill_Doc_Name = " "
            };

            _context.Request_Skill.Add(request);
            await _context.SaveChangesAsync();

            return 0;
        }

        [HttpPost("{resolve}/resolveRequestAddSkill")]
        public async Task<ActionResult<int>> PostResolveSkillRequest([FromBody] Request_Skill request, int resolve)
        {
            if (_context.Request_Skill == null)
            {
                return Problem("Entity set 'MyDbContext.Employee_Skill_Bridges'  is null.");
            }

            if(request == null)
            {
                return -1;
            }

           Request_Skill req = _context.Request_Skill.Where(t => t.Req_Skill_ID == request.Req_Skill_ID).FirstOrDefault();

            if (req == null)
            {
                return Problem("No skills");
            }

            req.Req_Skill_Approval_State = resolve;

            _context.Request_Skill.Update(req);
            await _context.SaveChangesAsync();

            if (req.Req_Skill_Approval_State == 1)//approved
            {

                //add new skill if doesn't exist, otherwise just change level
                var existingSkillBridge = _context.Employee_Skill_Bridges.Find(req.Emp_ID, req.Skill_ID);
                if (existingSkillBridge == null)
                {
                    Employee_Skill_Bridge t = new Employee_Skill_Bridge();
                    t.Skill_ID = req.Skill_ID;
                    t.Skill_Level = req.Req_Skill_Level;
                    t.Emp_ID = req.Emp_ID;
                    t.ES_Enabled = true;
                    _context.Employee_Skill_Bridges.Add(t);
                }
                else
                {
                    existingSkillBridge.Skill_Level = req.Req_Skill_Level;
                    _context.Employee_Skill_Bridges.Update(existingSkillBridge);
                }           

                await _context.SaveChangesAsync();
             }

            return 0;
        }

        [HttpGet("getAllUnresolvedAddSkillRequests")]
        public async Task<ActionResult<IEnumerable<Request_Skill>>> GetAllSkillRequests()
        {
            if (_context.Request_Skill == null)
            {
                return NotFound();
            }

            List<Request_Skill> allRequests = await _context.Request_Skill.Where(t => t.Req_Skill_Approval_State == 0).ToListAsync();

            return allRequests;
        }

        [HttpGet("{id}/getEmployeeUnresolvedAddSkillRequests")]
        public async Task<ActionResult<IEnumerable<Request_Skill>>> GetAllEmployeeSkillRequests(int id)
        {
            if (_context.Request_Skill == null)
            {
                return NotFound();
            }

            List<Request_Skill> allRequests = await _context.Request_Skill.Where(t => t.Req_Skill_Approval_State == 0 && t.Emp_ID == id).ToListAsync();

            return allRequests;
        }

        // PUT: Employees/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /*[HttpPut("{id}")]
        public async Task<IActionResult> PutEmployee(int id, Employee employee)
        {
            if (id != employee.Emp_ID)
            {
                return BadRequest();
            }

            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }*/

        // POST: Employees
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("register/{code}")]
        public async Task<ActionResult<Employee>> PostEmployee([FromBody] Employee employee, String code)
        {
            if (_context.Employees == null)
            {
                return Problem("Entity set 'MyDbContext.Employees'  is null.");
            }
            //check if code matches
            if (_context.New_Employee_Codes == null)
                return Problem("Entity set 'MyDbContext.New_Employee_Codes' is null.");
            New_Employee_Code? codeInDB = _context.New_Employee_Codes.Where(t => t.Code_Code == code).FirstOrDefault();
            if (codeInDB == null)
                return Problem("No matching code found in database");
            if (codeInDB.Code_Has_Been_Used)
                return Problem("Cannot reuse an old code");
            codeInDB.Code_Has_Been_Used = true;

            employee.Emp_ID = null;
            employee.Emp_Rating = 0;
            employee.Emp_Password = PasswordHasher.HashPassword(employee.Emp_Password);
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmployee", new { id = employee.Emp_ID }, employee);
        }

        // POST: Employees - REMOVE THIS FUNCTION AFTER DEVELOPMENT!!!!!
        /*[HttpPost("DodgyRegister")]
        public async Task<ActionResult<Employee>> PostEmployee([FromBody] Employee employee)
        {
            if (_context.Employees == null)
            {
                return Problem("Entity set 'MyDbContext.Employees'  is null.");
            }

            // NO CODE VERFICATION OCCURS

            employee.Emp_ID = null;
            employee.Emp_Rating = 0;
            employee.Emp_Password = PasswordHasher.HashPassword(employee.Emp_Password);
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmployee", new { id = employee.Emp_ID }, employee);
        }*/

        // POST: Employee/skill
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("skill")]
        public async Task<ActionResult<Employee_Skill_Bridge>> PostEmployeeSkill(Employee_Skill_Bridge skill)
        {
            if (_context.Employee_Skill_Bridges == null)
            {
                return Problem("Entity set 'MyDbContext.Employee_Skill_Bridges'  is null.");
            }
            _context.Employee_Skill_Bridges.Add(skill);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmployee_Skill_Bridge", new { id = skill.Skill_ID }, skill);
        }

        //post: assign skill to employee with level
        [HttpPost("{id}/assignSkills")]
        public async Task<IActionResult> PostAssignSkills(int id, List<IdWithLevel> skillsWithLevels)
        {
            if (_context.Employee_Skill_Bridges == null)
            {
                return Problem("Entity set 'MyDbContext.Employee_Skill_Bridges'  is null.");
            }
            foreach (IdWithLevel s in skillsWithLevels)
            {
                //add new skill if doesn't exist, otherwise just change level
                var existingSkillBridge = _context.Employee_Skill_Bridges.Find(id, s.id);
                if (existingSkillBridge == null)
                {
                    Employee_Skill_Bridge t = new Employee_Skill_Bridge();
                    t.Skill_ID = s.id;
                    t.Skill_Level = s.level;
                    t.Emp_ID = id;
                    t.ES_Enabled = true;
                    _context.Employee_Skill_Bridges.Add(t);
                }
                else
                {
                    existingSkillBridge.Skill_Level = s.level;
                    _context.Employee_Skill_Bridges.Update(existingSkillBridge);
                }    

                

            }

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // DELETE: Employees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            if (_context.Employees == null)
            {
                return NotFound();
            }
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            //_context.Employees.Remove(employee);
            employee.Emp_Enabled = false;
            _context.Employees.Update(employee);


            await _context.SaveChangesAsync();

            return NoContent();



        }

        private bool EmployeeExists(int id)
        {
            return (_context.Employees?.Any(e => e.Emp_ID == id)).GetValueOrDefault();
        }

        //post a user's profile pic
        //Employees/5/profilepic
        [HttpPost("{id}/profilepic")]
        public async Task<IActionResult> Post(int id, IFormFile file)
        {
            //validate id
            if (!EmployeeExists(id)) { return NotFound(); }
             
            return await ImageFileHandler.postImage("profilepic", id, file, this);
        }

        [HttpPost("{id}/document")]
        public async Task<IActionResult> PostDoc(int id, IFormFile file)
        {
            //validate id
            if (!EmployeeExists(id)) { return NotFound(); }

            var employeeOld = _context.Employees.Where(t => t.Emp_ID == id).FirstOrDefault();
            

            string fileName = ImageFileHandler.postDoc(employeeOld.Emp_Name, employeeOld.Emp_Sur, "document", id, file, this);

      
            var skillRequest = _context.Request_Skill.Where(t => t.Emp_ID == id).ToList();
            var numDocs = _context.Request_Skill.Where(t => t.Emp_ID == id && t.Req_Skill_Has_Doc != 0).ToList();

            if (skillRequest != null)
            {
                var skillInt = skillRequest.Max(t => t.Req_Skill_ID);

                var skillRequest2 = _context.Request_Skill.Where(t => t.Req_Skill_ID == skillInt).FirstOrDefault();
                //if (skillRequest.Req_Skill_Doc_Name.IsNullOrEmpty())
                //{
                skillRequest2.Req_Skill_Doc_Name = fileName;
                skillRequest2.Req_Skill_Has_Doc = numDocs.Count+1;

                _context.Request_Skill.Update(skillRequest2);
                await _context.SaveChangesAsync();
                //}
            }


            return Ok();
        }

        [HttpGet("{id}/profilepic")]
        public IActionResult Get(int id)
        {
            //validate id
            if (!EmployeeExists(id)) { return NotFound(); }
            return ImageFileHandler.getImage("profilepic", id, this);
        }

        [HttpGet("{id}/{docNum}/employeedocs")]//takes in employee id, and docNum, are returns that doc
        public IActionResult GetEmployeeDocs(int id, int docNum)
        {
            //validate id
            if (!EmployeeExists(id)) { return NotFound(); }

            var employeeOld = _context.Employees.Where(t => t.Emp_ID == id).FirstOrDefault();

            return ImageFileHandler.getDocument("document", employeeOld.Emp_Name, employeeOld.Emp_Sur, docNum, id, this);
        }

        //you first get number of employee docs, then do a get function for each of thsoe docs.
        [HttpGet("{id}/numEmployeeDocs")]
        public int GetNumEmpDocs(int id)
        {
            //validate id
            if (!EmployeeExists(id)) { return 0; }

            var employeeOld = _context.Employees.Where(t => t.Emp_ID == id).FirstOrDefault();

            return ImageFileHandler.getNumDocs("document", employeeOld.Emp_Name, employeeOld.Emp_Sur, id, this);
        }

        //this is posting an update
        [HttpPost("update")]
        public async Task<ActionResult<Employee>> PostDetailsUpdate([FromBody] Employee employee)
        {

            if (employee.Emp_ID == null)
            {
                return Problem("No employee ID set.");
            }

            var employeeOld = _context.Employees.Where(t => t.Emp_ID == employee.Emp_ID).FirstOrDefault();

            if (employeeOld == null)
            {
                return Problem("No such employee in DB.");
            }

            //here we check if the details had something, if so change them
            if (employee.Emp_Name != null && employee.Emp_Name.Length >= 1)
            {
                employeeOld.Emp_Name = employee.Emp_Name;
            }
            if (employee.Emp_Sur != null && employee.Emp_Sur.Length >= 1)
            {
                employeeOld.Emp_Sur = employee.Emp_Sur;
            }
            if (employee.Emp_Username != null && employee.Emp_Username.Length >= 2)
            {
                employeeOld.Emp_Username = employee.Emp_Username;
            }
            if (employee.Emp_Password != null && employee.Emp_Password.Length >= 6)
            {
                employeeOld.Emp_Password = PasswordHasher.HashPassword(employee.Emp_Password);
            }

            _context.Employees.Update(employeeOld);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return NotFound();
            }

            return employeeOld;
        }

        [HttpPost("newEmployeeCode")]
        public async Task<ActionResult<New_Employee_Code>> GetNewEmployeeCode(New_Employee_Code newCode)
        {
            if (_context.New_Employee_Codes == null)
            {
                return Problem("Entity set 'MyDbContext.New_Employee_Codes'  is null.");
            }

            //generate unique code:
            //10 random numbers
            String code = "";
            for (int i = 0; i < 10; i++)
            {
                int c = new Random().Next(0, 9);
                code += c.ToString();
            }
            newCode.Code_Code = code;

            _context.New_Employee_Codes.Add(newCode);
            
            if (newCode.New_Emp_Email != null)
            {
                IActionResult emailResponse = await PostEmail(newCode.New_Emp_Email, code);
                if (!(emailResponse is OkResult))
                {
                    return Problem("Problem sending email to " + newCode.New_Emp_Email + ", changes not saved.");
                }
            }
                


            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNewEmployeeCode", new { id = newCode.Code_ID }, newCode);
        }

        
        private async Task<IActionResult> PostEmail(string email, string code)
        {
            try
            {
                //message
                string msg = "<p>Good morning!</p>";
                msg += "<p>This is your invitation to the EPI-USE system for the Melorane Game Reserve!</p>";
                msg += "<p>Whether you're a new employee or contractor, we welcome you to the team!</p>";
                msg += "<p>Your invitation code is: <b>" + code + "</b></p>";
                msg += "<p>You can enter this code when registering on the app to gain access to the system.</p>";
                msg += "<p>You can download the WildTask EPI-USE app here: (insert link)</p>";
                msg += "<p>If you have any questions, please redirect them to (insert support address), as this email address is automated.</p>";
                msg += "<p>Glad you could join the team!</p>";
                msg += "<p>EPI-USE</p>";
                //could we attach an email signature/image for authenticity?

                //these are the sending address details. Obviously will want something more formal, maybe speak to the sponsors about using their email?
                string emailAddress = "testerman360@outlook.com";
                string emailPass = "Tester1235";

                //smtp protocol startup
                MailMessage message = new MailMessage();
                SmtpClient smtp = new SmtpClient();

                //sending email from
                message.From = new MailAddress(emailAddress);

                //sending email to:
                message.To.Add(new MailAddress(email));

                //subject
                message.Subject = "EPI-USE Registration code";

                message.IsBodyHtml = true;

                //setting properties of smtp
                message.Body = msg;

                smtp.Port = 587;//outlook smtp port
                smtp.Host = "smtp-mail.outlook.com"; //outlook smtp protocol
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(emailAddress, emailPass);
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                //send message
                smtp.Send(message);

                return Ok();
            }
            catch (Exception e)
            {

                return NotFound();

            }
        }

        [HttpPost("ratings")]
        public async Task<ActionResult<int>> PostRating([FromBody] List<Rating> listRating)
        {
            //bool shouldVectorise = false;
            if (listRating == null)
            {
                return Problem("No ratings");
            }
            //Rating r = listRating;
            foreach (Rating r in listRating)
            {
                if (r.Rating_Rating > 0)
                {
                    Rating rating = new Rating
                    {
                        Rating_Date = DateTime.Now,
                        Emp_ID = r.Emp_ID,
                        Task_ID = r.Task_ID,
                        Rating_Rating = r.Rating_Rating,
                        reviewer_ID = r.reviewer_ID,
                        Rating_Comment = r.Rating_Comment,
                    };
  
                    if (rating.Rating_Comment!="")
                    {
                        rating.Rating_Category = 0;
                        rating.Rating_Vector = new AIController(_context).VectoriseReviewCommentToString(r).Result;
                        //shouldVectorise = true; 
                    }
                    _context.Ratings.Add(rating);
                }
            }
            /*
            Ratings rating = new Ratings
            {
                Rating_Date = DateTime.Now,
                Emp_ID = 1,
                Task_ID = 1,
                Rating_Rating = 1,
                reviewer_ID = 1,
                Rating_Comment = "abc",
            };
            */

            // }


            await _context.SaveChangesAsync();


            foreach (Rating r in listRating)
            {
                var employeeOld = _context.Employees.Where(t => t.Emp_ID == r.Emp_ID).FirstOrDefault();

                List<Rating> list = await _context.Ratings.Where(b => b.Emp_ID == r.Emp_ID).ToListAsync();

                decimal total = 0;
                decimal count = 0;
                foreach(Rating rr in list)
                {
                    total += rr.Rating_Rating;
                    count++;
                }

                employeeOld.Emp_Rating = total / count;       
            }

            await _context.SaveChangesAsync();

            //vectorise all reviews if we have at least 1 review that had a comment
            //if (shouldVectorise)
            //    new AIController(_context).GetVectorisedComments();

            return 0;
        }

        [HttpPost("feedback")]
        public async Task<ActionResult<int>> PostFeedback([FromBody] Feedback feedback)
        {

            if (feedback == null)
            {
                return Problem("No feedback");
            }

            Feedback feedback2 = new Feedback
            {
                Feedback_Date = DateTime.Now,
                Emp_ID = feedback.Emp_ID,
                Task_ID = feedback.Task_ID,
                Feedback_Feedback = feedback.Feedback_Feedback,

            };
            _context.Feedback.Add(feedback2);

            await _context.SaveChangesAsync();

            return 0;
        }

        [HttpGet("{id}/getFeedback")]
        public async Task<ActionResult<IEnumerable<Feedback>>> GetFeedback(int id)
        {
            List<Feedback> list = await _context.Feedback.Where(b => b.Emp_ID == id).ToListAsync();

            return list;
        }

        [HttpGet("{id}/getCommentsTask")]
        public async Task<ActionResult<IEnumerable<Rating>>> getCommentsTask(int id)
        {
            List<Rating> list = await _context.Ratings.Where(b => b.Task_ID == id).ToListAsync();

            return list;
        }

        [HttpGet("{id}/getCommentsEmployee")]
        public async Task<ActionResult<IEnumerable<Rating>>> getCommentsEmployee(int id)
        {
            List<Rating> list = await _context.Ratings.Where(b => b.Emp_ID == id).ToListAsync();

            return list;
        }

        [HttpGet("{id}/getCommentsTaskEmployee")]
        public async Task<ActionResult<IEnumerable<Rating>>> getCommentsTaskEmployee(int id)
        {
            List<Rating> list = await _context.Ratings.Where(b => b.Emp_ID == id && b.Task_ID == id).ToListAsync();

            return list;
        }





    }

    public class LoginDetails
    {
        public string? Username { get; internal set; }
        public string? Password { get; internal set; }
    }
}
