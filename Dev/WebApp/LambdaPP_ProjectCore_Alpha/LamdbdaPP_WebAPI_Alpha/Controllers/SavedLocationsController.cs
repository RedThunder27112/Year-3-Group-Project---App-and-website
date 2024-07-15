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
    public class SavedLocationsController : ControllerBase
    {
        private readonly MyDbContext _context;

        public SavedLocationsController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/SavedLocations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SavedLocation>>> GetSavedLocations()
        {
          if (_context.SavedLocations == null)
          {
              return NotFound();
          }
            return await _context.SavedLocations.ToListAsync();
        }

        // GET: api/SavedLocations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SavedLocation>> GetSavedLocation(int id)
        {
          if (_context.SavedLocations == null)
          {
              return NotFound();
          }
            var savedLocation = await _context.SavedLocations.FindAsync(id);

            if (savedLocation == null)
            {
                return NotFound();
            }

            return savedLocation;
        }

        // GET: SavedLocations/5
        [HttpGet("fromCoordinates/{coords}")]
        public async Task<ActionResult<SavedLocation>> GetSavedLocation(string coords)
        {
            if (_context.SavedLocations == null)
            {
                return NotFound();
            }
            var savedLocation = await _context.SavedLocations.Where(t => t.Loc_Coordinates == coords).FirstOrDefaultAsync();

            if (savedLocation == null)
            {
                return NotFound();
            }

            return savedLocation;
        }

        // PUT: api/SavedLocations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSavedLocation(int id, SavedLocation savedLocation)
        {
            if (id != savedLocation.Loc_ID)
            {
                return BadRequest();
            }

            _context.Entry(savedLocation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SavedLocationExists(id))
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

        // POST: api/SavedLocations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SavedLocation>> PostSavedLocation(SavedLocation savedLocation)
        {
          if (_context.SavedLocations == null)
          {
              return Problem("Entity set 'MyDbContext.SavedLocations'  is null.");
          }
            _context.SavedLocations.Add(savedLocation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSavedLocation", new { id = savedLocation.Loc_ID }, savedLocation);
        }

        // DELETE: api/SavedLocations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSavedLocation(int id)
        {
            if (_context.SavedLocations == null)
            {
                return NotFound();
            }
            var savedLocation = await _context.SavedLocations.FindAsync(id);
            if (savedLocation == null)
            {
                return NotFound();
            }

            _context.SavedLocations.Remove(savedLocation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SavedLocationExists(int id)
        {
            return (_context.SavedLocations?.Any(e => e.Loc_ID == id)).GetValueOrDefault();
        }
    }
}
