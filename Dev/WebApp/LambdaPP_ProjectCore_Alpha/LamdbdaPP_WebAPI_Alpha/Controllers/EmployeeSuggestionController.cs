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
using System.Net;

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class EmployeeSuggestionController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly int COMPLETE_STATUS_ID = 2;

        public EmployeeSuggestionController(MyDbContext context)
        {
            _context = context;
        }


        //Get employees that match the skills and availability
        [HttpPost("suggestEmployees")]
        public async Task<ActionResult<IEnumerable<Employee?>>> SuggestEmployees(List<IdWithLevel> taskskills)
        {
            var EmployeesWithSkills = await _context.Employees.Include(e => e.Employee_Skill_Bridges).ToListAsync();

            //We have a list of skills and the levels we want to match.
            //We should go through employees with matching skill levels. Pick the employees with skills greater or equal to the task
            //In the end, do we want to return all employees, just ordered according to level of appropriateness?
            //Or do we just want to return employees that definitely fulfill the criteria?
            //Also have to consider availability. Maybe we do that separately.

            PriorityQueue<Employee, int> rankedEmployees = new PriorityQueue<Employee, int>();

            //determine employee overall rating for this task: -1 for each point that they're underqualified for a skill
            foreach (var e in EmployeesWithSkills)
            {
                int EmpRatingForTask = 0;
                foreach (var t in taskskills)
                {
                    //does employee have skill?
                    Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);

                    if (bridgeWithSkill != null)
                    {
                        //if so, take employee level - required level

                        EmpRatingForTask += (bridgeWithSkill.Skill_Level - t.level);
                    }
                    else
                    {
                        //if not, subtract required level
                        EmpRatingForTask -= t.level;
                    }

                }
                rankedEmployees.Enqueue(e, EmpRatingForTask);
            }


            //turn it back into a list - note the least qualified employee is at the start of the list, best at end
            List<Employee> toReturn = new List<Employee>();
            while (rankedEmployees.Count > 0)
            {
                Employee e = rankedEmployees.Dequeue();
                toReturn.Add(e);
            }
            toReturn.Reverse();
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(toReturn);
        }

        //Get employees that match the skills and availability
        [HttpPost("suggestEmployeesForActivity/{actID}")]
        public async Task<ActionResult<IEnumerable<Employee?>>> SuggestEmployees(List<IdWithLevel> taskskills, int actID)
        {
            var EmployeesWithSkills = await _context.Employees.Include(e => e.Employee_Skill_Bridges).ToListAsync();

            PriorityQueue<Employee, int> rankedEmployees = new PriorityQueue<Employee, int>();

            EmployeesController employeesController = new EmployeesController(_context);

            //determine employee overall rating for this task: -1 for each point that they're underqualified for a skill
            foreach (var e in EmployeesWithSkills)
            {
                int EmpRatingForTask = 0;
                foreach (var t in taskskills)
                {
                    //does employee have skill?
                    Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);

                    if (bridgeWithSkill != null)
                    {
                        //if so, take employee level - required level

                        EmpRatingForTask += (bridgeWithSkill.Skill_Level - t.level);
                    }
                    else
                    {
                        //if not, subtract required level
                        EmpRatingForTask -= t.level;
                    }

                }
                //3 is average rating, so if they're better than 3 it's good, less than 3 it's bad
                EmpRatingForTask += ((int)(await employeesController.GetEmployeeAvgRatingsForActivity((int)e.Emp_ID, actID)).Value) - 3;

                //see how many tasks the employee has that are in this activity. If it's above the max recommended tasks per emp, it's negative. 
                var empTasksInAct = (await employeesController.GetTasksForEmployeeForActivity((int)e.Emp_ID, actID)).Value;
                var activity = _context.Activities.Where(a => a.Act_ID == actID).FirstOrDefault();
                if (activity != null && empTasksInAct != null && activity.Act_Recommended_Max_Tasks_Per_Emp != null)
                {
                    int EmpTasksInActivity = empTasksInAct.Count();
                    int MaxRecommentedTasksPerEmp = (int)activity.Act_Recommended_Max_Tasks_Per_Emp;
                    //So if max=3 and we have 2, it's neutral cuz we'll be reaching the max. If we have less tasks, it's better cuz we're free. If more, it's bad
                    EmpRatingForTask += (MaxRecommentedTasksPerEmp - (EmpTasksInActivity + 1));
                }


                rankedEmployees.Enqueue(e, EmpRatingForTask);
            }


            //turn it back into a list - note the least qualified employee is at the start of the list, best at end
            List<Employee> toReturn = new List<Employee>();
            while (rankedEmployees.Count > 0)
            {
                Employee e = rankedEmployees.Dequeue();
                toReturn.Add(e);
            }
            toReturn.Reverse();
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(toReturn);
        }

        //Get employees that match the skills and availability
        [HttpPost("suggestEmployeesWithDateRange")]
        public async Task<ActionResult<IEnumerable<Employee?>>> SuggestEmployees(List<IdWithLevel> taskskills, DateTime startDate, DateTime endDate)
        {
            var EmployeesWithSkills = await _context.Employees.Include(e => e.Employee_Skill_Bridges).ToListAsync();

            PriorityQueue<Employee, int> rankedEmployees = new PriorityQueue<Employee, int>();

            //determine employee overall rating for this task: -1 for each point that they're underqualified for a skill
            foreach (var e in EmployeesWithSkills)
            {
                int EmpRatingForTask = 0;
                foreach (var t in taskskills)
                {
                    //does employee have skill?
                    Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);

                    if (bridgeWithSkill != null)
                    {
                        //if so, take employee level - required level

                        EmpRatingForTask += (bridgeWithSkill.Skill_Level - t.level);
                    }
                    else
                    {
                        //if not, subtract required level
                        EmpRatingForTask -= t.level;
                    }

                }

                //check availability: Subtract each task their busy with on that day from their rating. Might want to scale it, eg multiply it by 2 so availability is more nb
                int availability = (await new EmployeesController(_context).GetNumBusyTasks((int)e.Emp_ID, startDate, endDate)).Value;

                EmpRatingForTask -= availability;


                rankedEmployees.Enqueue(e, EmpRatingForTask);
            }


            //turn it back into a list - note the least qualified employee is at the start of the list, best at end
            List<Employee> toReturn = new List<Employee>();
            while (rankedEmployees.Count > 0)
            {
                Employee e = rankedEmployees.Dequeue();
                e.Task_Employee_Bridges = null;
                //e.Employee_Skill_Bridges = null;
                toReturn.Add(e);
            }
            toReturn.Reverse();
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(toReturn);
        }
        //Get employees that match the skills and availability
        [HttpPost("suggestEmployeesWithDateRange/{actID}")]
        public async Task<ActionResult<IEnumerable<Employee?>>> SuggestEmployees(List<IdWithLevel> taskskills, DateTime startDate, DateTime endDate, int actID)
        {
            var EmployeesWithSkills = await _context.Employees.Include(e => e.Employee_Skill_Bridges).ToListAsync();

            PriorityQueue<Employee, int> rankedEmployees = new PriorityQueue<Employee, int>();
            EmployeesController employeesController = new EmployeesController(_context);

            //determine employee overall rating for this task: -1 for each point that they're underqualified for a skill
            foreach (var e in EmployeesWithSkills)
            {
                int EmpRatingForTask = 0;
                foreach (var t in taskskills)
                {
                    //does employee have skill?
                    Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);

                    if (bridgeWithSkill != null)
                    {
                        //if so, take employee level - required level

                        EmpRatingForTask += (bridgeWithSkill.Skill_Level - t.level);
                    }
                    else
                    {
                        //if not, subtract required level
                        EmpRatingForTask -= t.level;
                    }

                }

                //check availability: Subtract each task their busy with on that day from their rating. Might want to scale it, eg multiply it by 2 so availability is more nb
                int availability = (await new EmployeesController(_context).GetNumBusyTasks((int)e.Emp_ID, startDate, endDate)).Value;

                EmpRatingForTask -= availability;

                //see how many tasks the employee has that are in this activity. If it's above the max recommended tasks per emp, it's negative. 
                var empTasksInAct = (await employeesController.GetTasksForEmployeeForActivity((int)e.Emp_ID, actID)).Value;
                var activity = _context.Activities.Where(a => a.Act_ID == actID).FirstOrDefault();
                if (activity != null && empTasksInAct != null && activity.Act_Recommended_Max_Tasks_Per_Emp != null)
                {
                    int EmpTasksInActivity =empTasksInAct.Count();
                    int MaxRecommentedTasksPerEmp = (int)activity.Act_Recommended_Max_Tasks_Per_Emp;
                    //So if max=3 and we have 2, it's neutral cuz we'll be reaching the max. If we have less tasks, it's better cuz we're free. If more, it's bad
                    EmpRatingForTask += (MaxRecommentedTasksPerEmp - (EmpTasksInActivity + 1));
                }
              


                //3 is average rating, so if they're better than 3 it's good, less than 3 it's bad
                EmpRatingForTask += ((int)(await employeesController.GetEmployeeAvgRatingsForActivity((int)e.Emp_ID, actID)).Value) - 3;

                rankedEmployees.Enqueue(e, EmpRatingForTask);
            }


            //turn it back into a list - note the least qualified employee is at the start of the list, best at end
            List<Employee> toReturn = new List<Employee>();
            while (rankedEmployees.Count > 0)
            {
                Employee e = rankedEmployees.Dequeue();
                e.Task_Employee_Bridges = null;
                toReturn.Add(e);
            }
            toReturn.Reverse();
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(toReturn);
        }

        //Get employees that match the skills and availability
        [HttpPost("suggestAvailableEmployeesOnly")]
        public async Task<ActionResult<IEnumerable<Employee?>>> SuggestAvailableEmployees(List<IdWithLevel> taskskills, DateTime startDate, DateTime endDate)
        {
            var EmployeesWithSkills = await _context.Employees.Include(e => e.Employee_Skill_Bridges).ToListAsync();
            PriorityQueue<Employee, int> rankedEmployees = new PriorityQueue<Employee, int>();

            //determine employee overall rating for this task: -1 for each point that they're underqualified for a skill
            foreach (var e in EmployeesWithSkills)
            {
                //check availability: if employee isn't fully available, don't add to list
                int availability = (await new EmployeesController(_context).GetNumBusyTasks((int)e.Emp_ID, startDate, endDate)).Value;
                if (availability > 0)
                    continue;

                int EmpRatingForTask = 0;
                foreach (var t in taskskills)
                {
                    //does employee have skill?
                    Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);

                    if (bridgeWithSkill != null)
                    {
                        //if so, take employee level - required level

                        EmpRatingForTask += (bridgeWithSkill.Skill_Level - t.level);
                    }
                    else
                    {
                        //if not, subtract required level
                        EmpRatingForTask -= t.level;
                    }

                }
                rankedEmployees.Enqueue(e, EmpRatingForTask);
            }

            //turn it back into a list - note the least qualified employee is at the start of the list, best at end
            List<Employee> toReturn = new List<Employee>();
            while (rankedEmployees.Count > 0)
            {
                Employee e = rankedEmployees.Dequeue();
                e.Task_Employee_Bridges = null;
                toReturn.Add(e);
            }
            toReturn.Reverse();
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(toReturn);
        }

        //Get employees that match the skills and availability
        [HttpPost("suggestAvailableEmployeesOnly/{actID}")]
        public async Task<ActionResult<IEnumerable<Employee?>>> SuggestAvailableEmployees(List<IdWithLevel> taskskills, DateTime startDate, DateTime endDate, int actID)
        {
            var EmployeesWithSkills = await _context.Employees.Include(e => e.Employee_Skill_Bridges).ToListAsync();

            PriorityQueue<Employee, int> rankedEmployees = new PriorityQueue<Employee, int>();
            EmployeesController employeesController = new EmployeesController(_context);

            //determine employee overall rating for this task: -1 for each point that they're underqualified for a skill
            foreach (var e in EmployeesWithSkills)
            {
                //check availability: if employee isn't fully available, don't add to list
                int availability = (await new EmployeesController(_context).GetNumBusyTasks((int)e.Emp_ID, startDate, endDate)).Value;
                if (availability > 0)
                    continue;

                int EmpRatingForTask = 0;
                foreach (var t in taskskills)
                {
                    //does employee have skill?
                    Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);

                    if (bridgeWithSkill != null)
                    {
                        //if so, take employee level - required level

                        EmpRatingForTask += (bridgeWithSkill.Skill_Level - t.level);
                    }
                    else
                    {
                        //if not, subtract required level
                        EmpRatingForTask -= t.level;
                    }
                }
                //3 is average rating, so if they're better than 3 it's good, less than 3 it's bad
                EmpRatingForTask += ((int)(await employeesController.GetEmployeeAvgRatingsForActivity((int)e.Emp_ID, actID)).Value) - 3;
                rankedEmployees.Enqueue(e, EmpRatingForTask);

                //see how many tasks the employee has that are in this activity. If it's above the max recommended tasks per emp, it's negative. 
                var empTasksInAct = (await employeesController.GetTasksForEmployeeForActivity((int)e.Emp_ID, actID)).Value;
                var activity = _context.Activities.Where(a => a.Act_ID == actID).FirstOrDefault();
                if (activity != null && empTasksInAct != null && activity.Act_Recommended_Max_Tasks_Per_Emp != null)
                {
                    int EmpTasksInActivity = empTasksInAct.Count();
                    int MaxRecommentedTasksPerEmp = (int)activity.Act_Recommended_Max_Tasks_Per_Emp;
                    //So if max=3 and we have 2, it's neutral cuz we'll be reaching the max. If we have less tasks, it's better cuz we're free. If more, it's bad
                    EmpRatingForTask += (MaxRecommentedTasksPerEmp - (EmpTasksInActivity + 1));
                }
            }

            //turn it back into a list - note the least qualified employee is at the start of the list, best at end
            List<Employee> toReturn = new List<Employee>();
            while (rankedEmployees.Count > 0)
            {
                Employee e = rankedEmployees.Dequeue();
                e.Task_Employee_Bridges = null;
                toReturn.Add(e);
            }
            toReturn.Reverse();
            return HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(toReturn);
        }

        //Get employees that match the skills, alongside a date range they're available, within the outer date range
        [HttpPost("suggestEmployeesAndSuggestDates")]
        public async Task<ActionResult<IEnumerable<EmployeeWithAvailability>>> SuggestEmployeesAndSuggestDates(List<IdWithLevel> taskskills, DateTime minStartDate, DateTime maxEndDate)
        {
            //start with the suggested employees based on skills
            var suggestedEmployees = (await SuggestEmployees(taskskills, minStartDate, maxEndDate)).Value;
            if (suggestedEmployees == null) return null;
            //then for each employee, get their available days

            List<EmployeeWithAvailability> toReturn = new List<EmployeeWithAvailability>();
            foreach (Employee e in suggestedEmployees)
            {
                if (e.Emp_ID == null) continue;
                List<DateTime> dates = new List<DateTime>();
                DateTime DateCounter = minStartDate;
                while (DateCounter < maxEndDate)
                {
                    Boolean isFree = (await new EmployeesController(_context).GetIsFreeOn((int)e.Emp_ID, DateCounter)).Value;

                    if (isFree)
                        dates.Add(DateCounter);
                    DateCounter = DateCounter.AddDays(1);
                }
                //if they're not available at all, don't recommend them?
                if (dates.Count != 0)
                {
                    e.Task_Employee_Bridges = null;
                    EmployeeWithAvailability emp = new EmployeeWithAvailability();
                    emp.employee = HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(e).Value;
                    emp.availableDates = dates;
                    toReturn.Add(emp);
                }
            }
            return toReturn;
        }
        //Get employees that match the skills, alongside a date range they're available, within the outer date range
        [HttpPost("suggestEmployeesAndSuggestDates/{actID}")]
        public async Task<ActionResult<IEnumerable<EmployeeWithAvailability>>> SuggestEmployeesAndSuggestDates(List<IdWithLevel> taskskills, DateTime minStartDate, DateTime maxEndDate, int actID)
        {
            //start with the suggested employees based on skills
            var suggestedEmployees = (await SuggestEmployees(taskskills, minStartDate, maxEndDate, actID)).Value;
            if (suggestedEmployees == null) return null;
            //then for each employee, get their available days

            List<EmployeeWithAvailability> toReturn = new List<EmployeeWithAvailability>();
            foreach (Employee e in suggestedEmployees)
            {
                if (e.Emp_ID == null) continue;
                List<DateTime> dates = new List<DateTime>();
                DateTime DateCounter = minStartDate;
                while (DateCounter < maxEndDate)
                {
                    Boolean isFree = (await new EmployeesController(_context).GetIsFreeOn((int)e.Emp_ID, DateCounter)).Value;

                    if (isFree)
                        dates.Add(DateCounter);
                    DateCounter = DateCounter.AddDays(1);
                }

                //see how many tasks the employee has that are in this activity. If it's above the max recommended tasks per emp, it's negative. 
                var empTasksInAct = (await new EmployeesController(_context).GetTasksForEmployeeForActivity((int)e.Emp_ID, actID)).Value;
                var activity = _context.Activities.Where(a => a.Act_ID == actID).FirstOrDefault();
                int EmpTasksInActivity = 0;
                int MaxRecommentedTasksPerEmp = 1;
                if (activity != null && empTasksInAct != null && activity.Act_Recommended_Max_Tasks_Per_Emp != null)
                {
                    EmpTasksInActivity = empTasksInAct.Count();
                    MaxRecommentedTasksPerEmp = (int)activity.Act_Recommended_Max_Tasks_Per_Emp;
                }


                //if they're not available at all, don't recommend them?
                if (dates.Count != 0  && (EmpTasksInActivity < MaxRecommentedTasksPerEmp))
                {
                    e.Task_Employee_Bridges = null;
                    EmployeeWithAvailability emp = new EmployeeWithAvailability();
                    emp.employee = HttpGetInfoCleaner.RemoveUnneededEmployeeInfo(e).Value;
                    emp.availableDates = dates;
                    toReturn.Add(emp);
                }

              
                
            }
            return toReturn;
        }


        //Given a list of employees with the dates they can work, create a merged list
        [HttpPost("mergeDates")]
        public async Task<ActionResult<IEnumerable<DateTime>>> mergeDates(IEnumerable<EmployeeWithAvailability> employeesWithAvailabilities)
        {
            if (employeesWithAvailabilities.IsNullOrEmpty())
                return NotFound();
            var toReturn = employeesWithAvailabilities.First().availableDates;
            Boolean isFirst = true;
            foreach (EmployeeWithAvailability e in employeesWithAvailabilities)
            {
                if (isFirst)
                {
                    isFirst = false;
                    continue;
                }

                //compare the available dates and only keep in the list if it's in both lists
                var newList = toReturn.Intersect(e.availableDates).ToList();
                toReturn = newList;
            }
            return toReturn;
        }

        //Get employees that match the skills and availability
        [HttpPost("explainSuggestion/{empID}")]
        public async Task<ActionResult<String>> ExplainSuggestion(int empID, List<IdWithLevel> taskskills, DateTime startDate, DateTime endDate)
        {
            var e = await _context.Employees.Include(e => e.Employee_Skill_Bridges).Where(e => e.Emp_ID == empID).FirstOrDefaultAsync();

            //We have a list of skills and the levels we want to match
            //putting a + for every positive weight on their score and - for every negative weight
            String response = "";

            foreach (var t in taskskills)
            {
                //does employee have skill?
                Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);
                var skill = _context.Skills.Where(s => s.Skill_ID == t.id).FirstOrDefault();

                if (bridgeWithSkill != null)
                {
                    if (bridgeWithSkill.Skill_Level >= t.level)
                        response += "Pro: ";
                    else
                        response += "Con: ";


                    response += "Has " + skill.Skill_Name + " skill at level " + bridgeWithSkill.Skill_Level + "\n";
                }
                else
                {
                    //if not, subtract required level
                    response += "Con: Does not have " + skill.Skill_Name + " skill\n";
                }

            }

            //check availability: Subtract each task their busy with on that day from their rating. Might want to scale it, eg multiply it by 2 so availability is more nb
            if (startDate != DateTime.MinValue && endDate != DateTime.MinValue)
            {
                int availability = (await new EmployeesController(_context).GetNumBusyTasks(empID, startDate, endDate)).Value;
                if (availability == 0)
                    response += "Pro: Is freely available in the date range";
                else
                    response += "Con: Has " + availability + " tasks during the date range";
            } 

            return new JsonResult(response);
        }

        //Get employees that match the skills and availability
        [HttpPost("explainSuggestion/{empID}/{actID}")]
        public async Task<ActionResult<String>> ExplainSuggestion(int empID, List<IdWithLevel> taskskills, DateTime startDate, DateTime endDate, int actID)
        {
            var e = await _context.Employees.Include(e => e.Employee_Skill_Bridges).Where(e => e.Emp_ID == empID).FirstOrDefaultAsync();

            //We have a list of skills and the levels we want to match
            //putting a + for every positive weight on their score and - for every negative weight
            String response = "";

            foreach (var t in taskskills)
            {
                //does employee have skill?
                Employee_Skill_Bridge? bridgeWithSkill = employeeBridgeWithSkill(e, t.id);
                var skill = _context.Skills.Where(s => s.Skill_ID == t.id).FirstOrDefault();

                if (bridgeWithSkill != null)
                {
                    if (bridgeWithSkill.Skill_Level >= t.level)
                        response += "Pro: ";
                    else
                        response += "Con: ";


                    response += "Has " + skill.Skill_Name + " skill at level " + bridgeWithSkill.Skill_Level + "\n";
                }
                else
                {
                    //if not, subtract required level
                    response += "Con: Does not have " + skill.Skill_Name + " skill\n";
                }

            }

            //check availability: Subtract each task their busy with on that day from their rating. Might want to scale it, eg multiply it by 2 so availability is more nb
            EmployeesController empController = new EmployeesController(_context);

            if (startDate != DateTime.MinValue && endDate != DateTime.MinValue)
            {
                int availability = (await empController.GetNumBusyTasks(empID, startDate, endDate)).Value;
                if (availability == 0)
                    response += "Pro: Is freely available in the date range\n";
                else
                    response += "Con: Has " + availability + " tasks during the date range\n";
            }

                

            //activity
            //3 is average rating, so if they're better than 3 it's good, less than 3 it's bad
            if (_context.Activities == null)
                return NotFound("Activities is null!");
            String? actName = _context.Activities.Find(actID).Act_Name;
            if (actName == null)
                return NotFound("Activity not found!");

            var rating = (await empController.GetEmployeeAvgRatingsForActivity(empID, actID)).Value;
            switch (rating)
            {
                case 0:
                    response += "Con: Has no ratings for the " + actName + " activity\n";
                    break;
                case <= 3:
                    response += "Con: Has rating of " + rating.ToString("#.##") + " for the " + actName + " activity\n";
                    break;
                default:
                    response += "Pro: Has rating of " + rating.ToString("#.##") + " for the " + actName + " activity\n";
                    break;
            }



            //see how many tasks the employee has that are in this activity. If it's above the max recommended tasks per emp, it's negative. 
            var empTasksInAct = (await new EmployeesController(_context).GetTasksForEmployeeForActivity((int)e.Emp_ID, actID)).Value;
            var activity = _context.Activities.Where(a => a.Act_ID == actID).FirstOrDefault();
            if (activity != null && empTasksInAct != null && activity.Act_Recommended_Max_Tasks_Per_Emp != null)
            {
                int EmpTasksInActivity = empTasksInAct.Count();
                int MaxRecommentedTasksPerEmp = (int)activity.Act_Recommended_Max_Tasks_Per_Emp;
                //So if max=3 and we have 2, it's neutral cuz we'll be reaching the max. If we have less tasks, it's better cuz we're free. If more, it's bad
                int difference = MaxRecommentedTasksPerEmp - (EmpTasksInActivity + 1);
                //if employee tasks is less than max recommended, it's a pro cuz they're free
                if (difference >= 0)
                    response += "Pro:";
                else
                    response += "Con:";
                response += " Has " + EmpTasksInActivity + " assigned " + actName + ": Maximum recommended is " + MaxRecommentedTasksPerEmp;
            }


           


            return new JsonResult(response);
        }

        private Employee_Skill_Bridge? employeeBridgeWithSkill(Employee e, int skill_ID)
        {
            foreach (Employee_Skill_Bridge esb in e.Employee_Skill_Bridges)
            {
                if (esb.Skill_ID == skill_ID)
                    return esb;
            }
            return null;
        }
    }
}
