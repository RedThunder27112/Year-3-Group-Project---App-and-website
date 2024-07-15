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

namespace LamdbdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class SkillsController : ControllerBase
    {
        private readonly MyDbContext _context;

        public SkillsController(MyDbContext context)
        {
            _context = context;
        }

        // GET: Skills
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
        {
          if (_context.Skills == null)
          {
              return NotFound();
          }
            return await _context.Skills.ToListAsync();
        }

        // GET: Skills
        [HttpGet("withEmployeeCount")]
        public async Task<ActionResult<IEnumerable<SkillWithEmployeeCount>>> GetSkillsWithEmpCount()
        {
            if (_context.Skills == null)
            {
                return NotFound();
            }
            var skills = await _context.Skills.Include(s => s.Employee_Skill_Bridges).ToListAsync();

            var skillsWithEmpCount = new List<SkillWithEmployeeCount>();
            if (skills.Count <= 0) return skillsWithEmpCount;


            foreach (Skill skill in skills)
            {
                SkillWithEmployeeCount skillWithEmployeeCount = new SkillWithEmployeeCount();
                skillWithEmployeeCount.emp_Count = skill.Employee_Skill_Bridges.Count();
                skill.Employee_Skill_Bridges = null;
                skillWithEmployeeCount.skill = skill;
                skillsWithEmpCount.Add(skillWithEmployeeCount);
            }
            return skillsWithEmpCount;
                
        }

        // GET: Skills
        [HttpGet("{id}/EmployeesWithSkill")]
        public async Task<ActionResult<IEnumerable<Employee_Skill_Bridge>>> GetEmployeesWithSkill(int id)
        {
            if (_context.Skills == null)
            {
                return NotFound();
            }
            //var employees = await _context.Skills.Include(s => s.employees).Where(s => s.Skill_ID == id).Select(s => s.employees).ToListAsync();
            var employees = await _context.Employee_Skill_Bridges.Where(esb => esb.Skill_ID == id).Include(esb => esb.employee).ToListAsync();

            return employees;

        }

        // GET: Skills/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Skill>> GetSkill(int id)
        {
          if (_context.Skills == null)
          {
              return NotFound();
          }
            var skill = await _context.Skills.FindAsync(id);

            if (skill == null)
            {
                return NotFound();
            }

            return skill;
        }

        // PUT: Skills/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSkill(int id, Skill skill)
        {
            if (id != skill.Skill_ID)
            {
                return BadRequest();
            }

            _context.Entry(skill).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SkillExists(id))
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

        // POST: Skills
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Skill>> PostSkill(Skill skill)
        {
          if (_context.Skills == null)
          {
              return Problem("Entity set 'MyDbContext.Skills'  is null.");
          }
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSkill", new { id = skill.Skill_ID }, skill);
        }

        // DELETE: Skills/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            if (_context.Skills == null)
            {
                return NotFound();
            }
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
            {
                return NotFound();
            }

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SkillExists(int id)
        {
            return (_context.Skills?.Any(e => e.Skill_ID == id)).GetValueOrDefault();
        }
    }
}
