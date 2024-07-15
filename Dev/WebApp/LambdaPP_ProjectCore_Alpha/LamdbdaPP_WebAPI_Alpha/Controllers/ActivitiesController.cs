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

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class ActivitiesController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly int COMPLETE_STATUS_ID = 2;

        public ActivitiesController(MyDbContext context)
        {
            _context = context;
        }

        // GET: Activities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Activity>>> GetActivities()
        {
          if (_context.Activities == null)
          {
              return NotFound();
          }
            return await _context.Activities.ToListAsync();
        }

        // GET: Activities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Activity>> GetActivity(int id)
        {
          if (_context.Activities == null)
          {
              return NotFound();
          }
            var activity = await _context.Activities.FindAsync(id);

            if (activity == null)
            {
                return NotFound();
            }

            return activity;
        }

        // GET: Activities/5
        [HttpGet("{id}/withTasks")]
        public async Task<ActionResult<Activity>> GetActivityWithTasks(int id)
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var activity = await _context.Activities.Include(a => a.tasks).Where(a => a.Act_ID == id).FirstOrDefaultAsync();
            if (activity == null)
            {
                return NotFound();
            }
            activity.tasks = activity.tasks.Where(t => t.Task_Enabled == true).ToList();

            return activity;
        }

        // GET: Activities with tasks per activity
        [HttpGet("taskCountPerActivity")]
        public async Task<ActionResult<IEnumerable<ActivityWithTaskCount>>> GetActivitiesWithTaskCount()
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var activity = await _context.Activities.Include(a => a.tasks).ToListAsync();

            if (activity == null)
            {
                return NotFound();
            }

            List<ActivityWithTaskCount> activitiesWithTaskCount = new List<ActivityWithTaskCount>();
            foreach(Activity a in activity)
            {
                ActivityWithTaskCount activityWithTaskCount = new ActivityWithTaskCount();
                activityWithTaskCount.task_Count = a.tasks.Where(t => t.Task_Enabled).Count();
                a.tasks = null;
                activityWithTaskCount.activity = a;
                activitiesWithTaskCount.Add(activityWithTaskCount);
            }

            return activitiesWithTaskCount;
        }

        // GET: Activities with tasks per activity
        [HttpGet("taskCountPerActivity/incompleteTasks")]
        public async Task<ActionResult<IEnumerable<ActivityWithTaskCount>>> GetActivitiesWithIncompleteTaskCount()
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var activity = await _context.Activities.Include(a => a.tasks).ToListAsync();

            if (activity == null)
            {
                return NotFound();
            }

            List<ActivityWithTaskCount> activitiesWithTaskCount = new List<ActivityWithTaskCount>();
            foreach (Activity a in activity)
            {
                ActivityWithTaskCount activityWithTaskCount = new ActivityWithTaskCount();

                activityWithTaskCount.task_Count = a.tasks.Where(t => t.Status_ID != COMPLETE_STATUS_ID && t.Task_Enabled).Count();
                a.tasks = null;
                activityWithTaskCount.activity = a;
                activitiesWithTaskCount.Add(activityWithTaskCount);
            }

            return activitiesWithTaskCount;
        }

        // GET: Activities with tasks per activity
        [HttpGet("taskCountPerActivity/CompleteTasks")]
        public async Task<ActionResult<IEnumerable<ActivityWithTaskCount>>> GetActivitiesWithCompleteTaskCount()
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var activity = await _context.Activities.Include(a => a.tasks).ToListAsync();

            if (activity == null)
            {
                return NotFound();
            }

            List<ActivityWithTaskCount> activitiesWithTaskCount = new List<ActivityWithTaskCount>();
            foreach (Activity a in activity)
            {
                ActivityWithTaskCount activityWithTaskCount = new ActivityWithTaskCount();

                activityWithTaskCount.task_Count = a.tasks.Where(t => t.Status_ID == COMPLETE_STATUS_ID && t.Task_Enabled).Count();
                a.tasks = null;
                activityWithTaskCount.activity = a;
                activitiesWithTaskCount.Add(activityWithTaskCount);
            }

            return activitiesWithTaskCount;
        }

        // GET: Activities with tasks per activity
        [HttpGet("taskCountPerActivity/ofTaskStatus/{id}")]
        public async Task<ActionResult<IEnumerable<ActivityWithTaskCount>>> GetActivitiesWithCompleteTaskCount(int id)
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var activity = await _context.Activities.Include(a => a.tasks).ToListAsync();

            if (activity == null)
            {
                return NotFound();
            }

            List<ActivityWithTaskCount> activitiesWithTaskCount = new List<ActivityWithTaskCount>();
            foreach (Activity a in activity)
            {
                ActivityWithTaskCount activityWithTaskCount = new ActivityWithTaskCount();

                activityWithTaskCount.task_Count = a.tasks.Where(t => t.Status_ID == id && t.Task_Enabled).Count();
                a.tasks = null;
                activityWithTaskCount.activity = a;
                activitiesWithTaskCount.Add(activityWithTaskCount);
            }

            return activitiesWithTaskCount;
        }

        // GET: Activities with tasks per activity
        [HttpGet("avgEmployeeCountForTasksInActivity/{actid}")]
        public async Task<ActionResult<double>> avgEmployeeCountForTasksInActivity(int actid)
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var tasks = await _context.Tasks.Where(t => t.Act_ID == actid && t.Task_Enabled).Include(t => t.Task_Employee_Bridges).ToListAsync();

            if (tasks == null)
            {
                return NotFound();
            }
            int empCount = 0;
            foreach (Database.Models.Task t in tasks)
            {
                empCount += t.Task_Employee_Bridges.Where(b => b.TEm_Enabled).Count();
            }

            return empCount/(double)tasks.Count;
        }

        // PUT: Activities/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutActivity(int id, Activity activity)
        {
            if (id != activity.Act_ID)
            {
                return BadRequest();
            }

            _context.Entry(activity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityExists(id))
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

        // POST: Activities
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Activity>> PostActivity(Activity activity)
        {
          if (_context.Activities == null)
          {
              return Problem("Entity set 'MyDbContext.Activities'  is null.");
          }
            activity.Act_Creation_Date = DateTime.Now;
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetActivity", new { id = activity.Act_ID }, activity);
        }

        // DELETE: Activities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            if (_context.Activities == null)
            {
                return NotFound();
            }
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound();
            }

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ActivityExists(int id)
        {
            return (_context.Activities?.Any(e => e.Act_ID == id)).GetValueOrDefault();
        }
    }
}
