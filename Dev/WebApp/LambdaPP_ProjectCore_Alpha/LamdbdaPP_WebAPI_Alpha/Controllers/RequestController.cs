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
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using LambdaPP_WebAPI_Alpha.Helpers;
using Azure.Core;

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class RequestController : ControllerBase
    {
        private readonly MyDbContext _context;

        public RequestController(MyDbContext context)
        {
            _context = context;
        }

        public enum REQUEST_APPROVAL
        {
            UNHANDLED,
            APPROVED,
            DENIED
        }

        const string REQUEST_TYPE_EQUIPMENT = "eqp";
        const string REQUEST_TYPE_STOCK = "stock";
        const string REQUEST_TYPE_REMOVAL = "removal";
        const string REQUEST_TYPE_EXTENSION = "extension";

        const int REQUEST_MADE_STATUS_ID = 4;
        const int REQUEST_APPROVED_STATUS_ID = 5;
        const int REQUEST_DENIED_STATUS_ID = 6;

        const int EXTENSION_MADE_STATUS_ID = 7;
        const int EXTENSION_APPROVED_STATUS_ID = 9;
        const int EXTENSION_DENIED_STATUS_ID = 10;

        const int REMOVAL_MADE_STATUS_ID = 8;
        const int REMOVAL_APPROVED_STATUS_ID = 11;
        const int REMOVAL_DENIED_STATUS_ID = 12;
        // GET: api/Request
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Task_Request>>> GetTask_Request()
        {
          if (_context.Task_Requests == null)
          {
              return NotFound();
          }
            return await _context.Task_Requests.ToListAsync();
        }
        [HttpGet("unresolved")]
        public async Task<ActionResult<IEnumerable<Task_Request>>> GetUnresolvedRequests()
        {
            if (_context.Task_Requests == null)
                return NotFound();
            var requests = await _context.Task_Requests.Where(r => r.Req_Approval == ((int)REQUEST_APPROVAL.UNHANDLED)).Include(t => t.Task).ToListAsync();
            if (requests == null)
                return NotFound();
            
            foreach (Task_Request r in requests)
                r.Task = HttpGetInfoCleaner.RemoveUnneededTaskInfo(r.Task);
            return requests;
        }

        [HttpGet("resolved")]
        public async Task<ActionResult<IEnumerable<Task_Request>>> GetResolvedRequests()
        {
            if (_context.Task_Requests == null)
                return NotFound();
            var requests =  await _context.Task_Requests.Where(r => r.Req_Approval != ((int)REQUEST_APPROVAL.UNHANDLED)).Include(t => t.Task).ToListAsync();
            if (requests == null)
                return NotFound();
            foreach (Task_Request r in requests)
                r.Task = HttpGetInfoCleaner.RemoveUnneededTaskInfo(r.Task);
            return requests;
        }

        // GET: api/Request/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Task_Request>> GetTask_Request(int id)
        {
          if (_context.Task_Requests == null)
          {
              return NotFound();
          }
            var task_Request = await _context.Task_Requests.FindAsync(id);

            if (task_Request == null)
            {
                return NotFound();
            }

            return task_Request;
        }

        // PUT: api/Request/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask_Request(int id, Task_Request task_Request)
        {
            if (id != task_Request.Req_ID)
            {
                return BadRequest();
            }

            _context.Entry(task_Request).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Task_RequestExists(id))
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

        [HttpPut("{id}/Approve")]
        public async Task<IActionResult> ApproveTask_Request(int id)
        {
            var request = _context.Task_Requests.Where(t => t.Req_ID == id).FirstOrDefault();
            if (request == null)
                return NotFound();

            request.Req_Approval = (int)REQUEST_APPROVAL.APPROVED;
            try
            {
                //create a task update matching the request
                Task_Update update = new Task_Update();
                update.Emp_ID = request.Emp_ID;
                update.Task_ID = request.Task_ID;
                update.Update_Time = DateTime.Now;
                update.Update_Enabled = true;
               

                if (request.Req_Type == REQUEST_TYPE_REMOVAL)
                {
                    update.Updated_Status_ID = REMOVAL_APPROVED_STATUS_ID;
                }
                else
                 if (request.Req_Type == REQUEST_TYPE_EXTENSION)
                {
                    update.Updated_Status_ID = EXTENSION_APPROVED_STATUS_ID;
                }
                else
                {
                    update.Updated_Status_ID = REQUEST_APPROVED_STATUS_ID;
                }


                //Update task's status accordingly
                var task = _context.Tasks.Where(t => t.Task_ID == update.Task_ID).FirstOrDefault();
                if (task == null)
                {
                    return NotFound();
                }
                else
                {
                    task.Status_ID = (int)update.Updated_Status_ID;  
                }

                if (request.Req_Type == REQUEST_TYPE_STOCK)
                {
                    update.Update_Description = "Stock Request Accepted:\n" + request.Req_Description;

                    //set the task-stock bridge to contain the new stock
                    //first get the stock
                    String req = request.Req_Request;
                    //format: stockID quantity\n
                    String[] stockswithquantity = req.Split("\n");
                    foreach (String s in stockswithquantity)
                    {
                        if (s == "") break;
                        String[] tokens = s.Split(" ");
                        int stockID = Int32.Parse(tokens[0]);
                        int Quantity = Int32.Parse(tokens[1]);


                        if (_context.Task_Stock_Bridges == null)
                        {
                            return Problem("Entity set 'MyDbContext.Task_Stock_Bridges'  is null.");
                        }

                        Task_Stock_Bridge? tsb = _context.Task_Stock_Bridges.Where(b => b.Stock_ID == stockID && b.Task_ID == request.Task_ID).FirstOrDefault();

                        if (tsb != null)
                        {
                            tsb.Quantity_Used = Quantity;

                            _context.Task_Stock_Bridges.Update(tsb);


                        }

                        //remove the stock from the database

                        if (_context.Stock == null)
                        {
                            return Problem("Entity set 'MyDbContext.Stock'  is null.");
                        }
                        Stock? stock = _context.Stock.Find(stockID);
                        if (stock != null)
                        {
                            stock.Stock_Quantity -= Quantity;
                            _context.Stock.Update(stock);

                            //adds a record of the stock being used.
                            Stock_Record newRecord = new Stock_Record();
                            
                            newRecord.Stock_ID = stock.Stock_ID;
                            newRecord.Record_Amount = Quantity;
                            newRecord.Record_Date = DateTime.Now;

                            _context.Stock_Record.Add(newRecord);

                            await _context.SaveChangesAsync();

                        }
                           


                    }

                }
                else if (request.Req_Type == REQUEST_TYPE_EQUIPMENT)
                {
                    update.Update_Description = "Equipment Request Accepted:\n" + request.Req_Description;

                    //set the task-stock bridge to contain the new stock
                    //first get the stock
                    String req = request.Req_Request;
                    //format: stockID quantity\n
                    String[] eqpwithquantity = req.Split("\n");
                    foreach (String s in eqpwithquantity)
                    {
                        if (s == "") break;
                        String[] tokens = s.Split(" ");
                        int eqpID = Int32.Parse(tokens[0]);
                        int Quantity = Int32.Parse(tokens[1]);


                        if (_context.Task_Equipment_Bridges == null)
                        {
                            return Problem("Entity set 'MyDbContext.Task_Equipment_Bridges'  is null.");
                        }

                        Task_Equipment_Bridge? tsb = _context.Task_Equipment_Bridges.Where(b => b.Eqp_ID == eqpID && b.Task_ID == request.Task_ID).FirstOrDefault();

                        if (tsb != null)
                        {
                            tsb.Quantity_Held = Quantity;

                            _context.Task_Equipment_Bridges.Update(tsb);
                        }

                    }

                }
                else if (request.Req_Type == REQUEST_TYPE_REMOVAL)
                {
                    var employeeOld = _context.Employees.Where(t => t.Emp_ID == request.Emp_ID).FirstOrDefault();
                    update.Update_Description = "Removal request for " + employeeOld.Emp_Name+ " has been approved:\n" + request.Req_Description;

                    var taskOld = _context.Task_Employee_Bridges.Where(t => t.Task_ID == request.Task_ID && t.Emp_ID == request.Emp_ID).FirstOrDefault();

                    _context.Remove(taskOld);
                    await _context.SaveChangesAsync();

                }
                else if (request.Req_Type == REQUEST_TYPE_EXTENSION)
                {
                    var taskOld = _context.Tasks.Where(t => t.Task_ID == request.Task_ID).FirstOrDefault();


                    request.Req_Date = ((DateTime)taskOld.Task_Deadline).AddDays(3);
     
                    _context.Update(request);
                    await _context.SaveChangesAsync();

                    var employeeOld = _context.Employees.Where(t => t.Emp_ID == request.Emp_ID).FirstOrDefault();
                    update.Update_Description = "Extension request accepted. New task due date is " + request.Req_Date.Year + "/" + request.Req_Date.Month + "/" + request.Req_Date.Day + ":\n" + request.Req_Description;


                    taskOld.Task_Deadline = request.Req_Date;
                    _context.Update(taskOld);
                    await _context.SaveChangesAsync();

                }

                if (_context.Task_Updates == null)
                {
                    return Problem("Entity set 'MyDbContext.Task_Updates'  is null.");
                }
                _context.Task_Updates.Add(update);

                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Task_RequestExists(id))
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

        [HttpPut("{id}/Deny")]
        public async Task<IActionResult> DenyTask_Request(int id)
        {
            var request = _context.Task_Requests.Where(t => t.Req_ID == id).FirstOrDefault();
            if (request == null)
                return NotFound();

            request.Req_Approval = (int)REQUEST_APPROVAL.DENIED;
            try
            {
                //create a task update matching the request
                Task_Update update = new Task_Update();
                update.Emp_ID = request.Emp_ID;
                update.Task_ID = request.Task_ID;
                update.Update_Time = DateTime.Now;
                update.Update_Enabled = true;
               

                if (request.Req_Type == REQUEST_TYPE_REMOVAL)
                {
                    update.Updated_Status_ID = REMOVAL_DENIED_STATUS_ID;
                }
                else
                if (request.Req_Type == REQUEST_TYPE_EXTENSION)
                {
                    update.Updated_Status_ID = EXTENSION_DENIED_STATUS_ID;
                }
                else
                {
                    update.Updated_Status_ID = REQUEST_DENIED_STATUS_ID;
                }

                //Update task's status accordingly
                var task = _context.Tasks.Where(t => t.Task_ID == update.Task_ID).FirstOrDefault();
                if (task == null)
                {
                    return NotFound();
                }
                else
                {
                    task.Status_ID = (int)update.Updated_Status_ID;
                }

                if (request.Req_Type == REQUEST_TYPE_STOCK)
                {
                    update.Update_Description = "Stock Request Denied:\n" + request.Req_Description;

                    //set the task-stock bridge to contain the new stock
                    //first get the stock
                    String req = request.Req_Request;
                    //format: stockID quantity\n
                    String[] stockswithquantity = req.Split("\n");
                    foreach (String s in stockswithquantity)
                    {
                        if (s == "") break;
                        String[] tokens = s.Split(" ");
                        int stockID = Int32.Parse(tokens[0]);
                        int Quantity = Int32.Parse(tokens[1]);


                        if (_context.Task_Stock_Bridges == null)
                        {
                            return Problem("Entity set 'MyDbContext.Task_Stock_Bridges'  is null.");
                        }

                        Task_Stock_Bridge? tsb = _context.Task_Stock_Bridges.Where(b => b.Stock_ID == id && b.Task_ID == request.Task_ID).FirstOrDefault();

                        if (tsb != null)
                        {
                            //we are disabling the request because it's been denied

                            _context.Task_Stock_Bridges.Remove(tsb);
                        }
                    }

                }
                else if (request.Req_Type == REQUEST_TYPE_EQUIPMENT)
                {
                    update.Update_Description = "Equipment request denied:\n" + request.Req_Description;

                    //set the task-stock bridge to contain the new stock
                    //first get the stock
                    String req = request.Req_Request;
                    //format: stockID quantity\n
                    String[] eqpwithquantity = req.Split("\n");
                    foreach (String s in eqpwithquantity)
                    {
                        if (s == "") break;
                        String[] tokens = s.Split(" ");
                        int eqpID = Int32.Parse(tokens[0]);
                        int Quantity = Int32.Parse(tokens[1]);


                        if (_context.Task_Equipment_Bridges == null)
                        {
                            return Problem("Entity set 'MyDbContext.Task_Equipment_Bridges'  is null.");
                        }

                        Task_Equipment_Bridge? tsb = _context.Task_Equipment_Bridges.Where(b => b.Eqp_ID == id && b.Task_ID == request.Task_ID).FirstOrDefault();

                        if (tsb != null)
                        {
                            //we are disabling the equipment request because it's been denied
                            _context.Task_Equipment_Bridges.Remove(tsb);
                        }
                    }
                }
                else if (request.Req_Type == REQUEST_TYPE_REMOVAL)
                {
                    var employeeOld = _context.Employees.Where(t => t.Emp_ID == request.Emp_ID).FirstOrDefault();
                    update.Update_Description = "Removal request for " + employeeOld.Emp_Name + " has been denied:\n" + request.Req_Description;

                }
                else if (request.Req_Type == REQUEST_TYPE_EXTENSION)
                {
                    var employeeOld = _context.Employees.Where(t => t.Emp_ID == request.Emp_ID).FirstOrDefault();
                    update.Update_Description = "Extension request rejected:\n" + request.Req_Description;

                }

                if (_context.Task_Updates == null)
                {
                    return Problem("Entity set 'MyDbContext.Task_Updates'  is null.");
                }
                _context.Task_Updates.Add(update);

                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Task_RequestExists(id))
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


        // POST: api/Request
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Task_Request>> PostTask_Request(Task_Request task_Request)
        {
          if (_context.Task_Requests == null)
          {
              return Problem("Entity set 'MyDbContext.Task_Request'  is null.");
          }

            task_Request.Req_Approval = (int)REQUEST_APPROVAL.UNHANDLED;
            _context.Task_Requests.Add(task_Request);


            //create a task update matching the request
            Task_Update update = new Task_Update();
            update.Emp_ID = task_Request.Emp_ID;
            update.Task_ID = task_Request.Task_ID;
            update.Update_Time = DateTime.Now;
            update.Update_Enabled = true;

            if(task_Request.Req_Type == REQUEST_TYPE_REMOVAL)
            {
                update.Updated_Status_ID = REMOVAL_MADE_STATUS_ID;
            }
            else
            if (task_Request.Req_Type == REQUEST_TYPE_EXTENSION)
            {
                update.Updated_Status_ID = EXTENSION_MADE_STATUS_ID;
            }
            else
            {
                update.Updated_Status_ID = REQUEST_MADE_STATUS_ID;
            }

                

            //Update task's status accordingly
            var task = _context.Tasks.Where(t => t.Task_ID == update.Task_ID).FirstOrDefault();
            if (task == null)
            {
                return NotFound();
            }
            else
            {
                task.Status_ID = (int)update.Updated_Status_ID;
            }

            if (task_Request.Req_Type == REQUEST_TYPE_STOCK)
            {
                update.Update_Description = "Stock Requested";

                //set the task-stock bridge to contain the new stock
                //first get the stock
                String request = task_Request.Req_Request;
                //format: stockID quantity\n
                String[] stockswithquantity = request.Split("\n");
                foreach (String s in stockswithquantity)
                {
                    if (s == "") break;
                    String[] tokens = s.Split(" ");
                    int stockID = Int32.Parse(tokens[0]);
                    int Quantity = Int32.Parse(tokens[1]);

                    Task_Stock_Bridge tsb = new Task_Stock_Bridge();
                    tsb.Task_ID = task_Request.Task_ID;
                    tsb.Stock_ID = stockID;
                    tsb.Quantity_Used = 0;
                    tsb.Quantity_Needed = Quantity;
                    tsb.TS_Enabled = true;
                    if (_context.Task_Stock_Bridges == null)
                    {
                        return Problem("Entity set 'MyDbContext.Task_Stock_Bridges'  is null.");
                    }
                    _context.Task_Stock_Bridges.Add(tsb);

                }

            }
            else if (task_Request.Req_Type == REQUEST_TYPE_EQUIPMENT)
            {
                update.Update_Description = "Equipment Requested";

                //set the task-eqp bridge to contain the new eqp
                //first get the equipment
                String request = task_Request.Req_Request;
                //format: eqpID quantity\n
                String[] eqpwithquantity = request.Split("\n");
                foreach (String s in eqpwithquantity)
                {
                    if (s == "") break;
                    String[] tokens = s.Split(" ");
                    int eqpID = Int32.Parse(tokens[0]);
                    int Quantity = Int32.Parse(tokens[1]);

                    Task_Equipment_Bridge tsb = new Task_Equipment_Bridge();
                    tsb.Task_ID = task_Request.Task_ID;
                    tsb.Eqp_ID = eqpID;
                    tsb.Quantity_Held = 0;
                    tsb.Quantity_Needed = Quantity;
                    tsb.TE_Enabled = true;
                    if (_context.Task_Equipment_Bridges == null)
                    {
                        return Problem("Entity set 'MyDbContext.Task_Equipment_Bridges'  is null.");
                    }
                    _context.Task_Equipment_Bridges.Add(tsb);

                }

            }
            else if (task_Request.Req_Type == REQUEST_TYPE_REMOVAL)
            {

                update.Update_Description = "Employee Removal Requested";


            }
            else if (task_Request.Req_Type == REQUEST_TYPE_EXTENSION)
            {
                update.Update_Description = "Extension Requested";
            }

            if (_context.Task_Updates == null)
            {
                return Problem("Entity set 'MyDbContext.Task_Updates'  is null.");
            }
            _context.Task_Updates.Add(update);
            await _context.SaveChangesAsync();



            return CreatedAtAction("GetTask_Request", new { id = task_Request.Req_ID }, task_Request);
        }

        // DELETE: api/Request/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask_Request(int id)
        {
            if (_context.Task_Requests == null)
            {
                return NotFound();
            }
            var task_Request = await _context.Task_Requests.FindAsync(id);
            if (task_Request == null)
            {
                return NotFound();
            }

            _context.Task_Requests.Remove(task_Request);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool Task_RequestExists(int id)
        {
            return (_context.Task_Requests?.Any(e => e.Req_ID == id)).GetValueOrDefault();
        }
    }
}
