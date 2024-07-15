using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LambdaPP_WebAPI_Alpha.Database;
using LambdaPP_WebAPI_Alpha.Database.Models;
using LambdaPP_WebAPI_Alpha.Helpers;

namespace LamdbdaPP_WebAPI_Alpha.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly MyDbContext _context;

        public StatusController(MyDbContext context)
        {
            _context = context;
        }

        // GET: Status
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Task_Status>>> GetTaskStatuses()
        {
          if (_context.TaskStatuses == null)
          {
              return NotFound();
          }
            return HttpGetInfoCleaner.RemoveUnneededStatusesInfo(await _context.TaskStatuses.ToListAsync());
        }

        // GET: Status/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Task_Status>> GetTask_Status(int id)
        {
          if (_context.TaskStatuses == null)
          {
              return NotFound();
          }
            var task_Status = await _context.TaskStatuses.FindAsync(id);

            if (task_Status == null)
            {
                return NotFound();
            }

            return task_Status;
        }

        // PUT: Status/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask_Status(int id, Task_Status task_Status)
        {
            if (id != task_Status.Status_ID)
            {
                return BadRequest();
            }

            _context.Entry(task_Status).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Task_StatusExists(id))
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

        // POST: Status
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Task_Status>> PostTask_Status(Task_Status task_Status)
        {
          if (_context.TaskStatuses == null)
          {
              return Problem("Entity set 'MyDbContext.TaskStatuses'  is null.");
          }
            _context.TaskStatuses.Add(task_Status);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask_Status", new { id = task_Status.Status_ID }, task_Status);
        }

        // DELETE: Status/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask_Status(int id)
        {
            if (_context.TaskStatuses == null)
            {
                return NotFound();
            }
            var task_Status = await _context.TaskStatuses.FindAsync(id);
            if (task_Status == null)
            {
                return NotFound();
            }

            _context.TaskStatuses.Remove(task_Status);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool Task_StatusExists(int id)
        {
            return (_context.TaskStatuses?.Any(e => e.Status_ID == id)).GetValueOrDefault();
        }
    }
}
