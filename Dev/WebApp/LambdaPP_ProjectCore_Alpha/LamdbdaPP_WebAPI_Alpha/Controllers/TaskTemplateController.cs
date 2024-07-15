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
using LamdbdaPP_WebAPI_D3.Database.Models;

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class TaskTemplateController : ControllerBase
    {
        private readonly MyDbContext _context;

        public TaskTemplateController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/TaskTemplate
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Task_Template>>> GetTask_Templates()
        {
          if (_context.Task_Templates == null)
          {
              return NotFound();
          }
            return await _context.Task_Templates.Where(t => t.Template_Enabled).ToListAsync();
        }

        // GET: api/TaskTemplate/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Task_Template>> GetTask_Template(int? id)
        {
          if (_context.Task_Templates == null)
          {
              return NotFound();
          }
            var task_Template = await _context.Task_Templates.FindAsync(id);

            if (task_Template == null)
            {
                return NotFound();
            }

            return task_Template;
        }

        // GET: api/TaskTemplate/5
        [HttpGet("{id}/toTask")]
        public async Task<ActionResult<Database.Models.Task>> GetTaskFromTemplate(int? id)
        {
            if (_context.Task_Templates == null)
            {
                return NotFound();
            }
            var task_Template = await _context.Task_Templates.FindAsync(id);

            if (task_Template == null)
            {
                return NotFound();
            }

            Database.Models.Task taskFromTemplate = new Database.Models.Task
            {
                Task_Date_Started = DateTime.Now,
                Task_Description = task_Template.Task_Description,
                Task_Enabled = true,
                Task_Name = task_Template.Task_Name,
                Act_ID = (task_Template.Act_ID is null) ? -1 : (int)task_Template.Act_ID,

            };
            if (task_Template.Task_Length_Days != null)
                taskFromTemplate.Task_Deadline = dateXWorkdaysAfterDate(taskFromTemplate.Task_Date_Started, (int)task_Template.Task_Length_Days);

            return taskFromTemplate;
        }

        // GET: api/TaskTemplate/5
        [HttpGet("forActivity/{id}")]
        public async Task<ActionResult<IEnumerable<Task_Template>>> GetTask_TemplatesFromAct(int? id)
        {
            if (_context.Task_Templates == null)
            {
                return NotFound();
            }
            var task_Templates = await _context.Task_Templates.Where(tt => tt.Act_ID == id && tt.Template_Enabled).ToListAsync();

            if (task_Templates == null)
            {
                return NotFound();
            }

            return task_Templates;
        }

        //Get all task template's skills required
        [HttpGet("{id}/skills")]
        public async Task<ActionResult<IEnumerable<SkillWithLevel?>>> GetTaskSkills(int id)
        {
            var bridges = await _context.Task_Template_Skill_Bridges.Include(b => b.skill).Where(b => b.Template_ID == id).ToListAsync();

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


        // PUT: api/TaskTemplate/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask_Template(int? id, Task_Template task_Template)
        {
            if (id != task_Template.Template_ID)
            {
                return BadRequest();
            }

            _context.Entry(task_Template).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Task_TemplateExists(id))
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

        // POST: api/TaskTemplate
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Task_Template>> PostTask_Template(Task_Template task_Template)
        {
          if (_context.Task_Templates == null)
          {
              return Problem("Entity set 'MyDbContext.Task_Templates'  is null.");
          }
            _context.Task_Templates.Add(task_Template);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask_Template", new { id = task_Template.Template_ID }, task_Template);
        }


        // POST: api/TaskTemplate
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("fromTask")]
        public async Task<ActionResult<Task_Template>> PostTask_Template(Database.Models.Task task)
        {
            if (_context.Task_Templates == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Templates'  is null.");
            }
            Task_Template task_Template = new Task_Template
            {
                Act_ID = task.Act_ID,
                Task_Description = task.Task_Description,
                Task_Name = task.Task_Name,
                Template_Enabled = true
            };
            if (task.Task_Date_Started != null && task.Task_Deadline != null)
            {
                task_Template.Task_Length_Days = countWorkdaysBetween(task.Task_Date_Started, task.Task_Deadline);
            }

            _context.Task_Templates.Add(task_Template);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask_Template", new { id = task_Template.Template_ID }, task_Template);
        }
        // PUT: api/TaskTemplate
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("fromTask")]
        public async Task<IActionResult> PutTask_Template(Database.Models.Task task)
        {
            if (_context.Task_Templates == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Templates'  is null.");
            }
            Task_Template? task_Template = _context.Task_Templates.Find(task.Task_ID);
            if (task_Template == null) return NotFound();

            task_Template.Act_ID = task.Act_ID;
            task_Template.Task_Description = task.Task_Description;
            task_Template.Task_Name = task.Task_Name;
            task_Template.Template_Enabled = true;
           
            if (task.Task_Date_Started != null && task.Task_Deadline != null)
            {
                task_Template.Task_Length_Days = countWorkdaysBetween(task.Task_Date_Started, task.Task_Deadline);
            }

            _context.Entry(task_Template).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Task_TemplateExists(task.Task_ID))
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
                var existingBridge = _context.Task_Template_Skill_Bridges.Where(t => t.Skill_ID == s.id && t.Template_ID == id).FirstOrDefault();
                if (existingBridge == null)
                {
                    Task_Template_Skill_Bridge t = new Task_Template_Skill_Bridge();
                    t.Skill_ID = s.id;
                    t.Skill_Level = s.level;
                    t.Template_ID = id;
                    t.TSk_Enabled = true;
                    _context.Task_Template_Skill_Bridges.Add(t);
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

        // POST: api/TaskTemplate
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("fromTask/withLocation/{location}")]
        public async Task<ActionResult<Task_Template>> PostTask_Template(Database.Models.Task task, String location)
        {
            if (_context.Task_Templates == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Templates'  is null.");
            }
            Task_Template task_Template = new Task_Template
            {
                Act_ID = task.Act_ID,
                Task_Description = task.Task_Description,
                Task_Name = task.Task_Name,
                Template_Enabled = true,
                Location = location
            };
            if (task.Task_Date_Started != null && task.Task_Deadline != null)
            {
                task_Template.Task_Length_Days = countWorkdaysBetween(task.Task_Date_Started, task.Task_Deadline);
            }

            _context.Task_Templates.Add(task_Template);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask_Template", new { id = task_Template.Template_ID }, task_Template);
        }

        private int? countWorkdaysBetween(DateTime startDate, DateTime? endDate)
        {
            //we count through the days, skipping if it's a weekend
            int count = 0;
            DateTime dateIndex = startDate;

            while (dateIndex <= endDate)
            {
                if (dateIndex.DayOfWeek != DayOfWeek.Saturday && dateIndex.DayOfWeek != DayOfWeek.Sunday)
                {
                    count++;
                }
                dateIndex = dateIndex.AddDays(1);
            }

            return count;
        }


        private DateTime? dateXWorkdaysAfterDate(DateTime startDate,int numDays)
        {
            //we count through the days, skipping if it's a weekend
            int count = numDays;
            DateTime dateIndex = startDate;

            while (count > 0)
            {
                if (dateIndex.DayOfWeek != DayOfWeek.Saturday && dateIndex.DayOfWeek != DayOfWeek.Sunday)
                {
                    count--;
                }
                dateIndex = dateIndex.AddDays(1);
            }

            return dateIndex;
        }

        // DELETE: api/TaskTemplate/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask_Template(int? id)
        {
            if (_context.Task_Templates == null)
            {
                return NotFound();
            }
            var task_Template = await _context.Task_Templates.FindAsync(id);
            if (task_Template == null)
            {
                return NotFound();
            }
            task_Template.Template_Enabled = false;
            //_context.Task_Templates.Remove(task_Template);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool Task_TemplateExists(int? id)
        {
            return (_context.Task_Templates?.Any(e => e.Template_ID == id)).GetValueOrDefault();
        }
    }
}
