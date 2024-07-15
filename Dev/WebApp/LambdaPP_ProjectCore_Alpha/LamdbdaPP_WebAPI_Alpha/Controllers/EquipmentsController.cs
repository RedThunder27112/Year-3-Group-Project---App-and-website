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
using LambdaPP_WebAPI_Alpha.Helpers;

namespace LamdbdaPP_WebAPI_Alpha.Controllers
{
    /*
     * Purpose of this controller:
     * To deal with the adding, updating, removal of equipment
     * For the equipment for a specific task, see the task controller
     * 
     */
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class EquipmentsController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly int COMPLETEDTASKID = 2;

        public EquipmentsController(MyDbContext context)
        {
            _context = context;
        }

        // GET: all Equipments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipment>>> GetEquipment()
        {
          if (_context.Equipment == null)
          {
              return NotFound();
          }
            return await _context.Equipment.ToListAsync();
        }

        // GET: Equipments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Equipment>> GetEquipment(int id)
        {
          if (_context.Equipment == null)
          {
              return NotFound();
          }
            var equipment = await _context.Equipment.FindAsync(id);

            if (equipment == null)
            {
                return NotFound();
            }

            return equipment;
        }

        // GET: Equipments/5
        [HttpGet("{id}/quantityavailable")]
        public async Task<ActionResult<int>> GetEquipmentQuantityAvailable(int id)
        {
            if (_context.Equipment == null)
            {
                return NotFound();
            }
            var equipment = await _context.Equipment.FindAsync(id);

            if (equipment == null)
            {
                return NotFound();
            }

            if (_context.Task_Equipment_Bridges == null)
            {
                return NotFound();
            }
            //the difference between quantity held and quantity available is that quantity held is what's actually not being used at the moment.
            //equipment that's been requested but not approved or denied is still UNAVAILABLE even though it's not actually being used

            var equipmentsUsed = _context.Task_Equipment_Bridges.Where(teb => teb.Eqp_ID == id && teb.TE_Enabled == true).Include(teb => teb.task).ToList();
            var availablequantity = equipment.Eqp_Quantity_Total;
            if (equipmentsUsed.Count > 0)
            {
                foreach (Task_Equipment_Bridge t in equipmentsUsed)
                {
                    //we ignore completed tasks, assuming that that equipment has been returned to the system.
                    if (t.task.Status_ID != COMPLETEDTASKID)
                        availablequantity -= t.Quantity_Needed;
                }
            }

            return availablequantity;
        }

        // GET: Equipments/5
        [HttpGet("{id}/quantityheld")]
        public async Task<ActionResult<int>> GetEquipmentQuantityHeld(int id)
        {
            if (_context.Equipment == null)
            {
                return NotFound();
            }
            var equipment = await _context.Equipment.FindAsync(id);

            if (equipment == null)
            {
                return NotFound();
            }

            if (_context.Task_Equipment_Bridges == null)
            {
                return NotFound();
            }
            var equipmentsUsed = _context.Task_Equipment_Bridges.Where(teb => teb.Eqp_ID == id && teb.TE_Enabled == true && teb.Quantity_Held > 0).Include(teb => teb.task).ToList();
            var availablequantity = equipment.Eqp_Quantity_Total;
            if (equipmentsUsed.Count > 0)
            {
                foreach (Task_Equipment_Bridge t in equipmentsUsed)
                {
                    //we ignore completed tasks, assuming that that equipment has been returned to the system.
                    if (t.task.Status_ID != COMPLETEDTASKID)
                        availablequantity -= t.Quantity_Held;
                }
            }

            return availablequantity;
        }

        // PUT: Equipments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEquipment(int id, Equipment equipment)
        {
            if (id != equipment.Eqp_ID)
            {
                return BadRequest();
            }

            _context.Entry(equipment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EquipmentExists(id))
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

        // POST: Equipments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Equipment>> PostEquipment(Equipment equipment)
        {
          if (_context.Equipment == null)
          {
              return Problem("Entity set 'MyDbContext.Equipment'  is null.");
          }
            _context.Equipment.Add(equipment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEquipment", new { id = equipment.Eqp_ID }, equipment);
        }

        // DELETE: api/Equipments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            if (_context.Equipment == null)
            {
                return NotFound();
            }
            var equipment = await _context.Equipment.FindAsync(id);
            if (equipment == null)
            {
                return NotFound();
            }

            _context.Equipment.Remove(equipment);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("{id}/image")]
        public IActionResult GetImg(int id)
        {
            //validate id
            if (!EquipmentExists(id)) { return NotFound(); }

            return ImageFileHandler.getImage("equipment", id, this);
        }

        [HttpPost("{id}/image")]
        public async Task<IActionResult> PostPic(int id, IFormFile file)
        {
            //validate id
            if (!EquipmentExists(id)) { return NotFound(); }

            return await ImageFileHandler.postImage("equipment", id, file, this);
        }


        private bool EquipmentExists(int id)
        {
            return (_context.Equipment?.Any(e => e.Eqp_ID == id)).GetValueOrDefault();
        }

        //TODO: - update equipment quantity only?
        // determine whether equipment is available, and how much is available

        //request equipment for task - add the entry to the bridge, but no equip given yet
        
        //assign equipment to task - if the entry exists already, change amount. Else add it then change amount

        //return equipment maybe? When no longer being used? Unless we just determine what equipment is being used
        //by looking at the tasks that aren't complete. So completing a task returns the equipment
    }
}
