using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace LambdaPP_WebAPI_Alpha.Helpers
{
    public class HttpGetInfoCleaner
    {
        //Tasks

        public static ActionResult<IEnumerable<Database.Models.Task?>> RemoveUnneededTasksInfo(List<Database.Models.Task?> list)
        {
            foreach (var task in list)      
                if (task != null)
                    RemoveUnneededTaskInfo(task);              
            
            return list;
        }
        public static Database.Models.Task? RemoveUnneededTaskInfo(Database.Models.Task? task)
        {        
            if (task != null)
            {
                if (task.activity != null)
                    task.activity.tasks = null;
                if (task.status != null)
                    task.status.tasks = null;
                task.Employees = null;
                task.equipments = null;
                task.Task_Updates = null;
                task.Task_Equipment_Bridges = null;
                task.Task_Employee_Bridges = null;
            }
            
            return task;
        }

        //Employees
        public static ActionResult<IEnumerable<Employee?>> RemoveUnneededEmployeeInfo(List<Employee?> list)
        {
            foreach (var emp in list)
            {
                if (emp != null)
                {
                    emp.Emp_Password = null;
                    emp.Emp_ID_Image = null;
                    emp.ratingsGiven = null;
                }

            }
            return list;
        }
        public static ActionResult<Employee?> RemoveUnneededEmployeeInfo(Employee? emp)
        {
          
            if (emp != null)
            {
                emp.Emp_Password = null;
                emp.Emp_ID_Image = null;
                emp.ratingsGiven = null;
            }

            return emp;
        }

        //task updates

        public static ActionResult<IEnumerable<Task_Update?>> RemoveUnneededTaskUpdateInfo(List<Task_Update?> list)
        {
            foreach (var upd in list)
            {
                if (upd != null)
                {
                    if (upd.employee != null)
                    {
                        upd.employee.Emp_Password = null;
                        upd.employee.Emp_ID_Image = null;
                        upd.employee.Task_Updates = null;
                        upd.employee.Employee_Skill_Bridges = null;
                        upd.employee.Tasks = null;
                        upd.employee.Task_Employee_Bridges = null;
                        //upd.employee.ratingsGiven = null;
                        upd.employee.skills = null;            
                    }
                    if (upd.task != null)
                    {
                        upd.task.status = null;
                        upd.task.activity = null;
                        upd.task.Task_Updates = null;
                        upd.task.equipments = null;
                        upd.task.Employees = null;
                        upd.task.Task_Equipment_Bridges = null;
                        upd.task.Task_Employee_Bridges = null;
                    }
                    
                }

            }
            return list;
        }

        //task statuses

        public static ActionResult<IEnumerable<Task_Status?>> RemoveUnneededStatusesInfo(List<Task_Status?> list)
        {
            foreach (var status in list)
                if (status != null)
                    RemoveUnneededStatusInfo(status);

            return list;
        }
        public static Task_Status? RemoveUnneededStatusInfo(Task_Status status)
        {
            if (status != null)
            {
                status.tasks = null;
            }

            return status;
        }
    }
}
