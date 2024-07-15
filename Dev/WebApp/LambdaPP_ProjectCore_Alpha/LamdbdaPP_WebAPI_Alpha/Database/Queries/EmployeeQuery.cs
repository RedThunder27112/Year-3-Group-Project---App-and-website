using LambdaPP_WebAPI_Alpha.Database.Models;
using LamdbdaPP_WebAPI_D3.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Employee" table
    public class EmployeeQuery : AbstractQuery
    {
        //calls base constructor
        public EmployeeQuery(MyDbContext context) : base(context) { }

        public List<Employee> GetEmployees()
        {
            return _context.Employees.ToList();
        }

        //searches the names of the Employees for a term
        public List<Employee> SearchEmployees(String ToSearch)
        {
            return _context.Employees.Where(a => a.Emp_Name.Contains(ToSearch) && a.Emp_Enabled == true).ToList();
        }

        //other methods needed:

        //edit Employee
        public Employee editEmployeeByID(int id, Employee employee)//not tested if works yet - did not make this async. Is that needed?
        {
            var e = _context.Employees.Where(a => a.Emp_ID.Equals(id)).FirstOrDefault();

            e.Emp_Name = employee.Emp_Name;
            e.Emp_Sur = employee.Emp_Sur;
            e.Emp_Username = employee.Emp_Username;
            e.Emp_Password = employee.Emp_Password;
            e.Emp_ID_Image = employee.Emp_ID_Image;

            _context.SaveChangesAsync();

            return e;
        }
        //delete Employee
        public bool deleteEmployee(int id)//not tested if works yet - did not make this async. Is that needed?
        {
            var e = _context.Employees.Where(a => a.Emp_ID.Equals(id)).FirstOrDefault();

            e.Emp_Enabled = false;

            _context.SaveChangesAsync();

            if (e.Emp_Enabled == false)
            {
                return true;
            }
            return false;
        }
        //get specific employee based on id
        public Employee getEmployeeByID(int id)//not tested if works yet
        {
            return _context.Employees.Where(a => a.Emp_ID.Equals(id) && a.Emp_Enabled == true).FirstOrDefault();
        }

        //searches the names of the Employees for a term
        public List<Employee> SearchEmployeesForTerm(String term)//isnt this the same as the name one?
        {
            return _context.Employees.Where(a => a.Emp_Name.Contains(term) && a.Emp_Enabled == true).ToList();
        }
        //get employee tasks? maybe that's the task page. Same for skills
        //verify employee username and password
        public int verifyEmployee(string UserName, string Password)//not tested if works yet
        {
            //is this not the same as login function? - not sure if the verify is something else?
            Employee? User = _context.Employees.Where(a => a.Emp_Username.Equals(UserName) && a.Emp_Password.Equals(PasswordHasher.HashPassword(Password))).FirstOrDefault();
            if (User == null || User.Emp_ID == null) { return -1; }
            else return (int)User.Emp_ID;

        }

        //get Employee by Skills
        //public List<Employee> recomendEmployees(Skill skill)//not tested if works yet
        //{
        //return _context.Employees.Where(a => a.Employee_Skill_Bridges.Contains(skill).ToList();
        // }
        public async Task<ActionResult<Employee>> Login(string UserName, string Password)
        {
            Employee? User = await _context.Employees.Where(a => a.Emp_Username.Equals(UserName) && a.Emp_Password.Equals(PasswordHasher.HashPassword(Password)) && a.Emp_Enabled == true).FirstOrDefaultAsync();
            if (User == null || User.Emp_ID == null) { return null; }
            else return User;
        }

        //registration: First the admin has to register the employee with a temp password.
        //then the user "registers" and updates the password? But they must already exist on the system

        public int Register(Employee employee)
        {

            //case 
            Employee? User = _context.Employees.Where(a => a.Emp_Username.Equals(employee.Emp_Username)).FirstOrDefault();

            if (User == null)
            {
                try
                {
                    _context.Employees.Add(employee);
                    return 0;
                }
                catch (Exception ex)
                {
                    //todo: print exception deetz
                    return -1;
                }
            }
            else if (User.Emp_Enabled)//if user exists and is enabled
            {
                return -2;
            }
            else
            {
                //this would be if a deleted user, is hired again in future or something
                //add user back in system - dont know if we want this though
                return -3;
            }



        }
    }
}
