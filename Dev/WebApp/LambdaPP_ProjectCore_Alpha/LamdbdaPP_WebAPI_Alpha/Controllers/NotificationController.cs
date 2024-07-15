using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LambdaPP_WebAPI_Alpha.Database;
using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.AspNetCore.Cors;
using LambdaPP_WebAPI_Alpha.Database.Models;

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class NotificationController : ControllerBase
    {
        
        private readonly MyDbContext _context;

        public NotificationController(MyDbContext context)
        {
            _context = context;
        }

        // GET: notifications for a specific employee ID
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications(int id)
        {
            if (_context.Notification == null)
            {
                return NotFound();
            }

            List<Notification> notification = await _context.Notification.Where(t => t.Emp_ID == id).ToListAsync();

            if (notification == null)
            {
                return NotFound();
            }

            return notification;
        }

        // GET: notification count for a specific employee ID
        [HttpGet("{id}/count")]
        public async Task<ActionResult<int>> GetNotificationCount(int id)
        {
            if (_context.Notification == null)
            {
                return NotFound();
            }

            return await _context.Notification.Where(t => t.Emp_ID == id).CountAsync();

        }

        // GET: notifications for a specific employee ID
        [HttpGet("{id}/unread")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetUnreadNotifications(int id)
        {
            if (_context.Notification == null)
            {
                return NotFound();
            }

            List<Notification> notification = await _context.Notification.Where(t => t.Emp_ID == id && t.Not_Viewed == false).ToListAsync();

            if (notification == null)
            {
                return NotFound();
            }

            return notification;
        }

        [HttpPost("{id}/clearnotifications")]
        public async Task<ActionResult<int>> postClearNotifications(int id)
        {
            if (_context.Notification == null)
            {
                return -1;
            }

            List<Notification> notification = await _context.Notification.Where(t => t.Emp_ID == id && t.Not_Viewed == true).ToListAsync();

            foreach(Notification n in notification)
            {
                _context.Remove(n);
            }
            await _context.SaveChangesAsync();

            return 0;
        }


        

        // GET: notification count for a specific employee ID
        [HttpGet("{id}/unread/count")]
        public async Task<ActionResult<int>> GetUnreadNotificationCount(int id)
        {
            if (_context.Notification == null)
            {
                return NotFound();
            }

            return await _context.Notification.Where(t => t.Emp_ID == id && t.Not_Viewed == false).CountAsync();

        }

        // GET: a number of latest notifications for a specific employee ID
        [HttpGet("{id}/latest/{count}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetLatestNotifications(int id, int count)
        {
            if (_context.Notification == null)
            {
                return NotFound();
            }

            List<Notification> notification = await _context.Notification.Where(t => t.Emp_ID == id).OrderByDescending(t => t.Not_Date).ToListAsync();

            if (notification == null)
            {
                return NotFound();
            }
            //if they're asking for more entries than there are, just return all the entries
            if (notification.Count <= count)
            {
                return notification;
            }

            return notification.GetRange(0,count);
        }


        // POST: Notification
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Notification>> PostNotification(Notification notification)
        {
            if (_context.Notification == null)
            {
                return Problem("Entity set 'MyDbContext.Notification'  is null.");
            }

            var taskBridge = await _context.Task_Employee_Bridges.Where(t => t.Task_ID == notification.Task_ID).ToListAsync();

            foreach(Task_Employee_Bridge t in taskBridge)
            {
                Notification n = new Notification()
                {
                    Emp_ID = t.Emp_ID,
                    Not_Date = notification.Not_Date,
                    Task_ID = notification.Task_ID,
                    Not_Description = notification.Not_Description,
                    Not_Viewed = notification.Not_Viewed,
                };
                _context.Notification.Add(n);
            }

           
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNotification", new { id = notification.Not_ID }, notification);
        }

        [HttpPost("{id}/viewed")]
        public async Task<ActionResult<int>> PostNotificationViewed(int id)
        {
            if (_context.Notification == null)
            {
                return Problem("Entity set 'MyDbContext.Notification'  is null.");
            }

            var notification = _context.Notification.Where(t => t.Not_ID == id).FirstOrDefault();

            if(notification == null)
            {
                return -1;
            }

            notification.Not_Viewed = true;
            await _context.SaveChangesAsync();

            return 0;
        }


    }
}
