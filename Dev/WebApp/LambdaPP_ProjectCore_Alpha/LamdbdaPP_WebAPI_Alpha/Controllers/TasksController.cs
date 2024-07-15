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

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class TasksController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly int COMPLETE_STATUS_ID = 2;

        public TasksController(MyDbContext context)
        {
            _context = context;
        }

        // GET: Tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasks()
        {
          if (_context.Tasks == null)
          {
              return NotFound();
          }
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Enabled).Include(u => u.status).ToListAsync());
        }

        // GET: Tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Database.Models.Task>> GetTask(int id)
        {
          if (_context.Tasks == null)
          {
              return NotFound();
          }
            //var task = await _context.Tasks.FindAsync(id);
            var task = _context.Tasks.Where(t => t.Task_ID == id).Include(t => t.status).Include(t => t.activity).FirstOrDefault();


            if (task == null)
            {
                return NotFound();
            }

            return task;
           
        }

        //get Incomplete tasks
        [HttpGet("incompletetasks")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task?>>> GetIncompleteTasks()
        {
          
            var tasks = await _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID).ToListAsync();

            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(tasks.ToList());
        }
        //get Incomplete tasks
        [HttpGet("incompletetasks/count")]
        public async Task<ActionResult<int>> GetCountIncompleteTasks()
        {
            return await _context.Tasks.Where(t => t.Task_Enabled && t.Status_ID != COMPLETE_STATUS_ID).CountAsync();
        }

        //get all tasks
        [HttpGet("total")]
        public async Task<ActionResult<int>> GetCountTasks()
        {
            return await _context.Tasks.Where(t => t.Task_Enabled).CountAsync();
        }

        // GET: Tasks/5/employees
        [HttpGet("{id}/tasksupervisor")]
        public async Task<ActionResult<Employee>> GetTaskSupervisor(int id)
        {
            var bridges =  _context.Task_Employee_Bridges.Where(b => b.Task_ID == id && b.IsSupervisor && b.TEm_Enabled).FirstOrDefault();

            if(bridges == null) { return null; }
            Database.Models.Employee employeeOld = _context.Employees.Where(t => t.Emp_ID == bridges.Emp_ID).FirstOrDefault();

            return employeeOld;     
        }

        // GET: Tasks/5/employees
        [HttpGet("{id}/employees")]
        public async Task<ActionResult<IEnumerable<Employee?>>> GetTaskEmployees(int id)
        {
            var bridges = await _context.Task_Employee_Bridges.Include(b => b.employee).Where(b => b.Task_ID == id).ToListAsync();
            var employees = bridges.Select(b => b.employee).Where(e => e.Emp_Enabled);

            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(employees.ToList());
        }

        // GET: Tasks/5/equipment 
        [HttpGet("{id}/equipment")]
        public async Task<ActionResult<IEnumerable<Equipment?>>> GetTaskEquipment(int id)
        {
            var bridges = await _context.Task_Equipment_Bridges.Include(b => b.equipment).Where(b => b.Task_ID == id).ToListAsync();
            var equipments = bridges.Select(b => b.equipment).Where(e => e.Eqp_Enabled);
            /*This was a solution to get around issues of cyclic lists. 
             * Not a problem anymore since in program.cs we ignore cycles
             * May be handy in future so I'm leaving this 1 instance - Gage
             * 
             * var options = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.Preserve
            };
            var json = JsonSerializer.Serialize(equipments, options);
            return Content(json, "application/json");*/
            return equipments.ToList();
        }

        [HttpGet("{id}/equipmentquantity")]
        public async Task<ActionResult<IEnumerable<Task_Equipment_Bridge?>>> getTaskEquipmentQuantity(int id)
        {
            var bridges = await _context.Task_Equipment_Bridges.Where(b => b.Task_ID == id).ToListAsync();

            return bridges.ToList();
        }

        [HttpGet("{id}/stockquantity")]
        public async Task<ActionResult<IEnumerable<Task_Stock_Bridge?>>> getTaskStockQuantity(int id)
        {
            var bridges = await _context.Task_Stock_Bridges.Where(b => b.Task_ID == id).ToListAsync();

            return bridges.ToList();
        }

        [HttpGet("{id}/stock")]
        public async Task<ActionResult<IEnumerable<Stock?>>> GetTaskStocks(int id)
        {
            var bridges = await _context.Task_Stock_Bridges.Include(b => b.stock).Where(b => b.Task_ID == id).ToListAsync();
            var stocks = bridges.Select(b => b.stock).Where(e => e.Stock_Enabled);

            return stocks.ToList();
        }
        


        // GET: Tasks/5/updates
        [HttpGet("{id}/updates")]
        public async Task<ActionResult<IEnumerable<Task_Update>>> GetTaskUpdates(int id)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //includes the employee who made the update
            return HttpGetInfoCleaner.RemoveUnneededTaskUpdateInfo(await _context.Task_Updates.Where(t => t.Task_ID == id).Include(u => u.employee).ToListAsync());
        }

        // GET: Tasks/updatesSince
        [HttpGet("updatesSince")]
        public async Task<ActionResult<IEnumerable<Task_Update>>> GetUpdatesSince(DateTime time)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //includes the employee who made the update
            return HttpGetInfoCleaner.RemoveUnneededTaskUpdateInfo(await _context.Task_Updates.Where(t => t.Update_Time > time).Include(u => u.employee).ToListAsync());
        }

        [HttpGet("update/{id}")]
        public async Task<ActionResult<Task_Update>> GetTaskUpdate(int id)
        {
            if (_context.Task_Updates == null)
            {
                return NotFound();
            }
            //includes the employee who made the update
            var update = await _context.Task_Updates.Where(u => u.Update_ID == id).Include(u => u.employee).FirstOrDefaultAsync();

            if (update == null)
            {
                return NotFound();
            }

            return update;
        }
        [HttpGet("{id}/latestUpdate")]
        public async Task<ActionResult<Task_Update>> GetLatestTaskUpdate(int id)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            //includes the employee who made the update
            var update = (new TaskQuery(_context)).mostRecentUpdate(id);

            if (update == null)
            {
                return NotFound();
            }

            return update;
        }


        /// <summary>

        [HttpPost("{id}/taskupdatepic")]
        public async Task<IActionResult> PostUpdatePic(int id, IFormFile file)
        {
            //validate id
            if (!TaskUpdateExists(id)) { return NotFound(); }
            
            return await ImageFileHandler.postImage("taskupdatepic", id, file, this);
        }

        [HttpGet("{id}/taskupdatepic")]
        public IActionResult GetUpdatePic(int id)
        {
            
            //validate id
            if (!TaskUpdateExists(id)) { return NotFound(); }

            return ImageFileHandler.getImage("taskupdatepic", id, this);
        }

        [HttpGet("{id}/hastaskupdatepic")]
        public async Task<ActionResult<Boolean>> HasUpdatePic(int id)
        {

            //validate id
            if (!TaskUpdateExists(id)) { return false; }

            return ImageFileHandler.hasImage("taskupdatepic", id, this);
        }

        /// <summary>



        // GET: Tasks/after
        [HttpGet("after")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksAfter([FromQuery] DateTime date)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline > date && t.Task_Enabled).Include(u => u.status).Include(t => t.activity).ToListAsync());
        }
        // GET: Tasks/before
        [HttpGet("before")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksBefore([FromQuery] DateTime date)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline < date && t.Task_Enabled).Include(u => u.status).Include(t => t.activity).ToListAsync());
        }

        // GET: Tasks/between
        [HttpGet("between")]
        public async Task<ActionResult<IEnumerable<Database.Models.Task>>> GetTasksBetween([FromQuery] DateTime date1, DateTime date2)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            return HttpGetInfoCleaner.RemoveUnneededTasksInfo(await _context.Tasks.Where(t => t.Task_Deadline > date1 && t.Task_Deadline < date2 && t.Task_Enabled).Include(u => u.status).Include(t => t.activity).ToListAsync());
        }

        //Get all task's skills required
        [HttpGet("{id}/skills")]
        public async Task<ActionResult<IEnumerable<SkillWithLevel?>>> GetTaskSkills(int id)
        {
            var bridges = await _context.Task_Skill_Bridges.Include(b => b.skill).Where(b => b.Task_ID == id).ToListAsync();

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

        // PUT: Tasks/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, Database.Models.Task task)
        {
            if (id != task.Task_ID)
            {
                return BadRequest();
            }

            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: Tasks
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Database.Models.Task>> PostTask(Database.Models.Task task)
        {
          if (_context.Tasks == null)
          {
              return Problem("Entity set 'MyDbContext.Tasks'  is null.");
          }
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask", new { id = task.Task_ID }, task);
        }


        // POST: Tasks/update
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("update")]
        public async Task<ActionResult<Task_Update>> PostTaskUpdate(Task_Update update)
        {
            if (_context.Task_Updates == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Updates'  is null.");
            }

            //check if admin posted update
            var employee = _context.Employees.Where(t => t.Emp_ID == update.Emp_ID && t.Emp_IsAdmin == true).FirstOrDefault();
            if (employee != null)
            {
                var location = _context.SavedLocations.Where(t => t.Loc_Coordinates == update.Update_Location).FirstOrDefault();
                if (update.Update_Description == "Initial location posted" && update.Updated_Status_ID == null && update.Update_Location != null && location != null)
                {
                    update.Update_Description = "The location for of the task is: " + location.Loc_Name;
                }
            }
            
            _context.Task_Updates.Add(update);
            

            // If the update had an updated status id, we want to change the status id of the task to the new status id
            if (update.Updated_Status_ID != null)
            {
                var task = _context.Tasks.Where(t => t.Task_ID == update.Task_ID).FirstOrDefault();
                if (task == null)
                {
                    return NotFound();
                }
                else
                {
                    task.Status_ID = (int)update.Updated_Status_ID;  
                }
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask_Update", new { id = update.Update_ID }, update);
        }

        //post: Assign employee to task
        [HttpPost("{id}/assignEmployees")]
        public async Task<IActionResult> PostAssignEmployees(int id, List<int> employeeids)
        {
            if (_context.Task_Employee_Bridges == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Employee_Bridges'  is null.");
            }
            foreach(int i in employeeids)
            {
                Task_Employee_Bridge t = new Task_Employee_Bridge();
                t.Task_ID = id;
                t.Emp_ID = i;
                t.TEm_Enabled = true;
                _context.Task_Employee_Bridges.Add(t);

                //create notification
                Notification notification = new Notification();
                notification.Emp_ID = i;
                notification.Task_ID = id;
                notification.Not_Date = DateTime.Now;
                notification.Not_Description = "New task assigned!";
                _context.Notification.Add(notification);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
        //post: Assign employee to task
        [HttpPost("{id}/assignEmployeeswithSupervisor/{supervisorID}")]
        public async Task<IActionResult> PostAssignEmployees(int id, List<int> employeeids, int supervisorID)
        {
            if (_context.Task_Employee_Bridges == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Employee_Bridges'  is null.");
            }
            foreach (int i in employeeids)
            {
                Task_Employee_Bridge t = new Task_Employee_Bridge();
                t.Task_ID = id;
                t.Emp_ID = i;
                t.TEm_Enabled = true;
                if (i == supervisorID) t.IsSupervisor = true;
                _context.Task_Employee_Bridges.Add(t);

                //create notification
                Notification notification = new Notification();
                notification.Emp_ID = i;
                notification.Task_ID = id;
                notification.Not_Date = DateTime.Now;
                notification.Not_Description = "New task assigned!";
                _context.Notification.Add(notification);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
        //post: assign skill to task with level
        [HttpPost("{id}/assignSkills")]
        public async Task<IActionResult> PostAssignSkills(int id, List<IdWithLevel> skillsWithLevels)
        {
            if (_context.Task_Skill_Bridges == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Skill_Bridges'  is null.");
            }
            foreach (IdWithLevel s in skillsWithLevels)
            {
                var existingBridge = _context.Task_Skill_Bridges.Where(t => t.Skill_ID == s.id && t.Task_ID == id).FirstOrDefault();
                if (existingBridge == null)
                {
                    Task_Skill_Bridge t = new Task_Skill_Bridge();
                    t.Skill_ID = s.id;
                    t.Skill_Level = s.level;
                    t.Task_ID = id;
                    t.TSk_Enabled = true;
                    _context.Task_Skill_Bridges.Add(t);
                }
                else
                {
                    existingBridge.Skill_Level = s.level;
                    existingBridge.TSk_Enabled = true;
                }       
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

            // DELETE: Tasks/5
            [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            task.Task_Enabled = false;
            //_context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //get Incomplete tasks
        [HttpGet("fixUpdates")]
        public int fixUpdates()
        {

            var tasks = _context.Tasks.ToList();

            foreach(Database.Models.Task t in tasks) 
            {
                var update = _context.Task_Updates.ToList();

                foreach (Database.Models.Task_Update u in update)
                {
                    if(u.Update_Description.Equals(""))
                    {
        
                        if(u.Updated_Status_ID != null)
                        {
                            var status = _context.TaskStatuses.Where(d => d.Status_ID == u.Updated_Status_ID).FirstOrDefault();

                            u.Update_Description = status.Status_Name;

                            _context.Task_Updates.Update(u);
                            _context.SaveChanges();

                        }
                        

                    }


                }


            }

            return 1;
        }

        private bool TaskExists(int id)
        {
            return (_context.Tasks?.Any(e => e.Task_ID == id)).GetValueOrDefault();
        }
        private bool TaskUpdateExists(int id)
        {
            return (_context.Task_Updates?.Any(e => e.Update_ID == id)).GetValueOrDefault();
        }
    }
}
