import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { catchError, map } from 'rxjs';
import Activity from './models/Activity';
import Employee from './models/Employee';
import Equipment from './models/Equipment';
import Stock from './models/Stock';
import Task from './models/Task';
import Request from './models/Request';
import { throwError } from 'rxjs';
import SkillWithLevel from './models/SkillWithLevel';
import IdWithLevel from './models/IdWithLevel';
import { DateService } from '../helpers/GetDates';
import Employee_Skill_Bridge from './models/Employee_Skill_Bridge';
import Rating from './models/Rating';
import Low_Stock from './models/Low_Stock';
import { KeyValue } from '@angular/common';
import SavedLocation from './models/SavedLocation';
import TaskUpdate from './models/TaskUpdate';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient) { }

  private developmentUrl: string = "https://localhost:7051"
  // private devRemoteUrl: string = "https://192.168.0.113:45455" //broken
  private deploymentUrl: string = "https://localhost:5001"
  private baseUrl: string = this.developmentUrl;

  private baseEmployeeUrl: string =  this.baseUrl + "/Employees"
  private baseTaskUrl: string = this.baseUrl + "/Tasks"
  private baseSkillUrl: string = this.baseUrl + "/Skills"
  private baseActivityUrl: string = this.baseUrl + "/Activities"
  private baseStockUrl: string = this.baseUrl + "/Stocks"
  private baseEquipUrl: string =this.baseUrl + "/Equipments"
  private baseRequestUrl: string =this.baseUrl + "/Request"
  private baseEmployeeSuggestionUrl: string = this.baseUrl + "/EmployeeSuggestion"
  private baseTaskTemplateUrl: string = this.baseUrl + "/TaskTemplate"
  private baseReportsUrl: string = this.baseUrl + "/Reports"
  private savedLocationsUrl: string = this.baseUrl + "/SavedLocations"
  private baseAIUrl: string = this.baseUrl + "/AI"

  // AUTH -----

  // register function
  register(user: FormGroup)
  {
    let name = user.get("name")?.value
    let surname = user.get("surname")?.value
    let email = user.get("email")?.value
    let password = user.get("password")?.value
    let admin = new Employee(name, surname, email, password, "Admin")

    return this.http.post<Employee>(`${this.baseEmployeeUrl}`, admin)
  }

  // login function
  login(loginObj: FormGroup)
  {
    return this.http.get<Employee>(`${this.baseEmployeeUrl}/?Username=${loginObj.get("email")?.value}&Password=${loginObj.get("password")?.value}`)
    .pipe(
      catchError((error) => {
        // Handle the error here, for example, show an error message or perform other actions
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed due to a server error. Please try again later.'));
      })
    );
  }

  // -----

  // get employee credentials
  getEmpCrendentials(empID: number)
  {
    return this.http.get<Employee>(`${this.baseEmployeeUrl}/${empID}`)
  }

  // profile picture
  getProfilePic(empID: number)
  {
    return this.http.get(`${this.baseEmployeeUrl}/${empID}/profilepic`, { responseType: 'blob'})
    .pipe(
      map((res: Blob) => URL.createObjectURL(res))
    )
  }

  // docs
  getDocCount(empID: number)
  {
    return this.http.get<number>(`${this.baseEmployeeUrl}/${empID}/numEmployeeDocs`)
  }
  // docs
  getDoc(empID: number, docNum: number)
  {
    return this.http.get(`${this.baseEmployeeUrl}/${empID}/${docNum}/employeedocs`, { responseType: 'blob'})
    .pipe(
      map((res: Blob) => URL.createObjectURL(res))
    )
  }


  // get all employees
  getAllEmployees()
  {
    return this.http.get<Employee[]>(`${this.baseEmployeeUrl}/all`)
  }

  // get employees
  getEmployee(empID: number)
  {
    return this.http.get<Employee>(`${this.baseEmployeeUrl}/${empID}`)
  }

  // get employees assiociated with a task
  getEmployeesByTask(taskID: number)
  {
    return this.http.get<Employee[]>(`${this.baseTaskUrl}/${taskID}/employees`)
  }

  // get employees assiociated with a task
  getSkillsByTask(taskID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskUrl}/${taskID}/skills`)
  }

  // get all tasks
  getAllTasks()
  {
    return this.http.get<any[]>(`${this.baseTaskUrl}`)
  }
  
  // get specific task
  getTask(taskID: number)
  {
    return this.http.get<any>(`${this.baseTaskUrl}/${taskID}`)
  }

  // get incomplete task count
  getIncompleteTasksCount()
  {
    return this.http.get<number>(`${this.baseTaskUrl}/incompletetasks/count`)
  }
  

  // update task
  updateTask(task: Task)
  {
    return this.http.put<any[]>(`${this.baseTaskUrl}/${task.task_ID}`, task)
  }
  updateTaskTemplate(task: Task)
  {
    return this.http.put<any[]>(`${this.baseTaskTemplateUrl}/fromTask`, task)
  }

  // delete task
  deleteTask(taskID: number)
  {
    return this.http.delete<any>(`${this.baseTaskUrl}/${taskID}`)
  }
  deleteTaskTemplate(taskID: number)
  {
    return this.http.delete<any>(`${this.baseTaskTemplateUrl}/${taskID}`)
  }

  getTaskUpdates(taskID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskUrl}/${taskID}/updates`)
  }
  postTaskUpdate(taskupdate: TaskUpdate)
  {
    return this.http.post<TaskUpdate>(`${this.baseTaskUrl}/update`,taskupdate)
  }

  getTaskStock(taskID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskUrl}/${taskID}/stock`)
  }
  getTaskEquipment(taskID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskUrl}/${taskID}/equipment`)
  }

  hasUpdatePicture(taskID: number)
  {
    return this.http.get<boolean>(`${this.baseTaskUrl}/${taskID}/hastaskupdatepic`)
  }

  // get an update picture
  getUpdatePicture(taskID: number)
  {
    return this.http.get(`${this.baseTaskUrl}/${taskID}/taskupdatepic`, { responseType: 'blob'})
    .pipe(
      map((res: Blob) => URL.createObjectURL(res))
    )
  }

  // get skills
  getSkills()
  {
    return this.http.get<any[]>(`${this.baseSkillUrl}`)
  }

  // get skills with employee count
  getSkillsWithEmployeeCount()
  {
    return this.http.get<any[]>(`${this.baseSkillUrl}/withEmployeeCount`)
  }

  // get employee's skills
  getEmployeeSkills(emp_id: number)
  {
    return this.http.get<any>(`${this.baseEmployeeUrl}/${emp_id}/skills`)
  }

  // get employee's rating count
  getEmployeeRatingCount(emp_id: number)
  {
    return this.http.get<any>(`${this.baseEmployeeUrl}/${emp_id}/numRatings`)
  }

  // get employee's ratings
  getEmployeeRatings(emp_id: number)
  {
    return this.http.get<Rating[]>(`${this.baseEmployeeUrl}/${emp_id}/ratings`)
  }  
  getEmployeeRatingsForTask(emp_id: number, task_id: number)
  {
    return this.http.get<Rating[]>(`${this.baseReportsUrl}/${emp_id}/ratingsFor/${task_id}`)
  }  

  getMostCommonComment(emp_id: number)
  {
    return this.http.get<KeyValue<number, string>>(`${this.baseReportsUrl}/${emp_id}/mostCommonComment`)
  }
  getMostCommonPositiveComment(emp_id: number)
  {
    return this.http.get<KeyValue<number, string>>(`${this.baseReportsUrl}/${emp_id}/mostCommonPositiveComment`)
  }
  getMostCommonNegativeComment(emp_id: number)
  {
    return this.http.get<KeyValue<number, string>>(`${this.baseReportsUrl}/${emp_id}/mostCommonNegativeComment`)
  }
  // get rating
  getRating(rating_id: number)
  {
    return this.http.get<Rating>(`${this.baseAIUrl}/review/${rating_id}`)
  }  

  getSimilarReviews(rating_id: number)
  {
    return this.http.get<Rating[]>(`${this.baseAIUrl}/nearestNeighbours/${rating_id}`)
  }  
  suggestReviewCategory(rating_id: number)
  {
    return this.http.get<number>(`${this.baseAIUrl}/suggestedCategory/${rating_id}`)
  } 

  saveCategory(rating_id: number, category: number)
  {
    return this.http.get(`${this.baseAIUrl}/saveCategory/${rating_id}/${category}`)
  }

  getTeamCompatability(team: Employee[])
  {
    let newTeam: Employee[] = []
    team.forEach(employee => {
      let newEmployee = new Employee(employee.emp_Name,employee.emp_Sur,employee.emp_Username,employee.emp_Password,"");
      newEmployee.emp_ID = employee.emp_ID;
      /*newEmployee.employee_Skill_Bridges = undefined;
      newEmployee.emp_ID_Image = "";*/
      newTeam.push(newEmployee);
    });
    return this.http.post<String[]>(`${this.baseAIUrl}/teamCompatability`,newTeam)
  }

  getAvgRatingPerMonth(emp_id: number)
  {
    return this.http.get<number[]>(`${this.baseReportsUrl}/${emp_id}/avgRatingPerMonth`);
  }
  getAvgSentimentPerMonth(emp_id: number)
  {
    return this.http.get<number[]>(`${this.baseReportsUrl}/${emp_id}/avgSentimentPerMonth`);
  }

   // get employee's Incomplete Tasks 
   getEmployeeTasksIncomplete(emp_id: number)
   {
     return this.http.get<Task[]>(`${this.baseEmployeeUrl}/${emp_id}/incompletetasks`)
   } 
   
  // get employee's Tasks in progress - the ones that they're MEANT to be doing today, excluding overdue tasks
  getNumEmployeeTasksMeantToBeInProgress(emp_id: number)
  {
    return this.http.get<number>(`${this.baseEmployeeUrl}/${emp_id}/numBusyTasks`)
  }  

   // get employee's Tasks due today 
   getEmployeeTasksDueToday(emp_id: number)
   {
     return this.http.get<Task[]>(`${this.baseReportsUrl}/DueToday/ForUser/${emp_id}`)
   } 

  // get employee's CompletedTasks
  getEmployeeTasksCompleted(emp_id: number)
  {
    return this.http.get<Task[]>(`${this.baseEmployeeUrl}/${emp_id}/completetasks`)
  }  
  // get employee's Completed Tasks that were completed over due date
  getEmployeeTasksCompletedOverDueDate(emp_id: number)
  {
    return this.http.get<Task[]>(`${this.baseReportsUrl}/CompletedOverDueDate/ForUser/${emp_id}`)
  }  

  // get employee's CompletedTasks completed early
  getEmployeeTasksCompletedEarly(emp_id: number)
  {
    return this.http.get<Task[]>(`${this.baseReportsUrl}/CompletedEarly/ForUser/${emp_id}`)
  }  

  getEmployeeAvgDateOfTaskCompletion(emp_id: number)
  {
    return this.http.get<number>(`${this.baseReportsUrl}/${emp_id}/completetasksDaysFromDueDate`)
  }  
  getAvgDateOfTaskCompletion()
  {
    return this.http.get<number>(`${this.baseReportsUrl}/completetasksDaysFromDueDate`)
  }  

  // get employee's Supervised Tasks
  getEmployeeTasksSupervised(emp_id: number)
  {
    return this.http.get<Task[]>(`${this.baseEmployeeUrl}/${emp_id}/tasks/supervised`)
  }  
  // get employee's Tasks where they're currently supervisor
  getEmployeeTasksSupervising(emp_id: number)
  {
    return this.http.get<Task[]>(`${this.baseEmployeeUrl}/${emp_id}/incompletetasks/supervised`)
  } 
  getEmployeeTasksUpcoming(emp_id: number)
  {
    return this.http.get<Task[]>(`${this.baseEmployeeUrl}/${emp_id}/upcomingTasks`)
  }   

  // get employee's avg rating for an activity
  getEmployeeAvgRatingForActivity(emp_id: number, actID: number)
  {
    return this.http.get<any>(`${this.baseEmployeeUrl}/${emp_id}/avgRatingForActivity/${actID}`)
  }

  // get activities
  getActivities()
  {
    return this.http.get<any[]>(`${this.baseActivityUrl}`) 
  }
  
  getActivity(actID: number)
  {
    return this.http.get<any>(`${this.baseActivityUrl}/${actID}`) 
  }

  // activities with tasks
  getActivitiesWithTasks(actID: number)
  {
    return this.http.get<any[]>(`${this.baseActivityUrl}/${actID}/withTasks`) 
  }

  // create task
  createTask(task: Task)
  {
    return this.http.post<any>(`${this.baseTaskUrl}`, task)
  }
  
  // assign employees to task
  assignEmployees(taskID: number, empIDs: number[])
  {
    return this.http.post<any>(`${this.baseTaskUrl}/${taskID}/assignEmployees`, empIDs) 
  }
  assignEmployeesWithSupervisor(taskID: number, supervisorID: number , empIDs: number[])
  {
    return this.http.post<any>(`${this.baseTaskUrl}/${taskID}/assignEmployeeswithSupervisor/${supervisorID}`, empIDs) 
  }


  // assign skills to task
  assignSkills(taskID: number, skillIDs: number[])
  {
    let skills: any[] = []
    skillIDs.forEach(s => {
      skills.push({id: s, level: 4}) // assuming a level 4 for now
    })

    return this.http.post<any>(`${this.baseTaskUrl}/${taskID}/assignSkills`, skills) 
  }

   // assign skills to employee
   assignEmployeeSkills(empID: number, skills: IdWithLevel[])
   {

     return this.http.post<any>(`${this.baseEmployeeUrl}/${empID}/assignSkills`, skills) 
   }

  // create employee
  createEmployee(user: FormGroup)
  {
    let name = user.get("name")?.value
    let surname = user.get("surname")?.value
    let email = user.get("email")?.value
    let password = "password" // default password is "password" until user changes it
    let role = user.get("role")?.value

    let employee = new Employee(name, surname, email, password, role)

    return this.http.post<Employee>(`${this.baseEmployeeUrl}`, employee) 
  }
  // update employee
  updateEmployee(employee: Employee)
  {
    return this.http.post<Employee>(`${this.baseEmployeeUrl}/update`, employee) 
  }

  // create activity
  createActivity(activity: Activity)
  {
    return this.http.post<Activity>(`${this.baseActivityUrl}`, activity)
  }
  updateActivity(activity: Activity)
  {
    return this.http.put<Activity>(`${this.baseActivityUrl}`, activity)
  }

  // get stock
  getAllStock()
  {
    return this.http.get<any[]>(`${this.baseStockUrl}`)
  }
  
  // get stock image
  getStockImage(stockID: number)
  {
    return this.http.get(`${this.baseStockUrl}/${stockID}/image`, { responseType: 'blob'})
    .pipe(
      map((res: Blob) => URL.createObjectURL(res))
    )
  }

  // get stock quantity available - excludes stock that's been requested but is pending approval
  getStockQuantityAvailable(stockID: number)
  {
    return this.http.get<number>(`${this.baseStockUrl}/${stockID}/quantityavailable`);
  }

  getStockUsedPerMonth(stockID: number)
  {
    return this.http.get<number[]>(`${this.baseStockUrl}/${stockID}/quantityUsedPerMonth`);
  }
  getLowStock(stockID: number)
  {
    return this.http.get<Low_Stock>(`${this.baseStockUrl}/lowstockreport/${stockID}`);
  }
  
  
  // equipment
  getAllEquipment() 
  {
    return this.http.get<any[]>(`${this.baseEquipUrl}`)
  }

  // get equipment image
  getEquipImage(eqpID: number)
  {
    return this.http.get(`${this.baseEquipUrl}/${eqpID}/image`, { responseType: 'blob'})
    .pipe(
      map((res: Blob) => URL.createObjectURL(res))
    )
  }

  // stock
  createStock(stockForm: FormGroup)
  {
    let name = stockForm.get("name")?.value
    let desc = stockForm.get("desc")?.value
    let quantity = stockForm.get("quantity")?.value
    let leadTime = stockForm.get("lead_Time")?.value 

    let stock = new Stock(name, desc, quantity);
    stock.stock_Lead_Time = leadTime;
    return this.http.post<any>(`${this.baseStockUrl}`, stock)
  }
  updateStock(stockForm: FormGroup, id: number)
  {
    let name = stockForm.get("name")?.value
    let desc = stockForm.get("desc")?.value
    let quantity = stockForm.get("quantity")?.value
    let leadTime = stockForm.get("lead_Time")?.value 

    let stock = new Stock(name, desc, quantity);
    stock.stock_ID = id;
    stock.stock_Lead_Time = leadTime;
    return this.http.put<any>(`${this.baseStockUrl}/${id}`, stock)
  }
  
  // equipment
  createEquip(equipForm: FormGroup)
  {
    let name = equipForm.get("name")?.value
    let desc = equipForm.get("desc")?.value
    let quantity = equipForm.get("quantity")?.value

    let equipment = new Equipment(name, desc, quantity);
    return this.http.post<any>(`${this.baseEquipUrl}`, equipment)
  }

  updateEquip(equipForm: FormGroup, id: number)
  {
    let name = equipForm.get("name")?.value
    let desc = equipForm.get("desc")?.value
    let quantity = equipForm.get("quantity")?.value

    let equipment = new Equipment(name, desc, quantity);
    equipment.eqp_ID = id;
    return this.http.put<any>(`${this.baseEquipUrl}/${id}`, equipment)
  }

  // get priority queue of best employees based on skill
  suggestBestEmployees(skillIDs: number[])
  {
    let suggestion: any[] = [] 
    skillIDs.forEach(s => {
      suggestion.push({skillID: s, level: 4}) // making default level 4 for now
    })

    return this.http.post<Employee[]>(`${this.baseTaskUrl}/suggestEmployees`, suggestion)
  }

  // get employee registration code
  getRegistrationCode(obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeUrl}/newEmployeeCode`, obj)
  }

  // get stock by ID
  getStockByID(stockID: number) 
  {
    return this.http.get<any>(`${this.baseStockUrl}/${stockID}`) 
  }
  
  // get equipment by ID
  getEquipByID(equipID: number) 
  {
    return this.http.get<any>(`${this.baseEquipUrl}/${equipID}`) 
  }
  
  // low stock
  getLowStockReport()
  {
    return this.http.get<any>(`${this.baseStockUrl}/lowstockreport`) 
  }

  // get all requests
  getRequests()
  {
    return this.http.get<any[]>(`${this.baseRequestUrl}`)
  }

  // get resolved
  getResolvedRequests()
  {
    return this.http.get<any[]>(`${this.baseRequestUrl}/resolved`)
  }

  // get unresolved
  getUnresolvedRequests()
  {
    return this.http.get<any[]>(`${this.baseRequestUrl}/unresolved`)
  }

  // approve
  approveRequest(id: Number)
  {
    return this.http.put<any>(`${this.baseRequestUrl}/${id}/Approve`,null)
  }

  // deny
  denyRequest(id: Number)
  {
    return this.http.put<any>(`${this.baseRequestUrl}/${id}/Deny`, null)
  }

  // get one skill
  getSkill(skillID : number)
  {
    return this.http.get<any>(`${this.baseSkillUrl}/${skillID}`)
  }

  // get one skill's employees
  getSkillEmployees(skillID : number)
  {
    return this.http.get<Employee_Skill_Bridge[]>(`${this.baseSkillUrl}/${skillID}/EmployeesWithSkill`)
  }

  // get incomplete tasks
  getNumIncompleteTask()
  {
    return this.http.get<any>(`${this.baseTaskUrl}/incompletetasks/count`)
  }

  // total number of tasks
  getTotalTasks()
  {
    return this.http.get<any>(`${this.baseTaskUrl}/total`)
  }

  // get tasks after certain date
  getTasksAfter(date: Date)
  {
    let myDate = DateService.convertDateFormat(date);
    return this.http.get<any>(`${this.baseTaskUrl}/after?date=${myDate}`)
  }

  // get tasks before certain date
  getTasksBefore(date: Date)
  {
    let myDate = DateService.convertDateFormat(date);
    return this.http.get<any>(`${this.baseTaskUrl}/before?date=${myDate}`)
  }

  // get tasks between certain date
  getTasksBetween(dateStart: Date, dateEnd: Date,)
  {
    let myDateStart = DateService.convertDateFormat(dateStart);
    let myDateEnd = DateService.convertDateFormat(dateEnd);
    return this.http.get<any>(`${this.baseTaskUrl}/between?date1=${myDateStart}&date2=${myDateEnd}`)
  }

  // get task supervisor
  getTaskSupervisor(taskID: number)
  {
    return this.http.get<Employee>(`${this.baseTaskUrl}/${taskID}/tasksupervisor`)
  }

  // creates a skill
  createSkill(skill: any)
  {
    return this.http.post<any>(`${this.baseSkillUrl}`, skill)
  }
  
  // get number of employees per skill
  getSkillCount()
  {
    return this.http.get<any>(`${this.baseSkillUrl}/withEmployeeCount`)
  }

  // get employees via skill
  getEmployeesWithSameSkill(skillID: number)
  {
    return this.http.get<any>(`${this.baseSkillUrl}/${skillID}/EmployeesWithSkill`)
  }

  // -- EMPLOYEE SUGGESTIONS --
  getEmployeeSuggestions(obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestEmployees`, obj)
  }

  getEmployeesForAct(actID: number, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestEmployeesForActivity/${actID}`, obj)
  }

  getEmployeesWithDateRange(startDate: any, endDate: any, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestEmployeesWithDateRange?startDate=${startDate}&endDate=${endDate}`, obj)
  }

  getEmployeesWithDateRangeForAct(actID: number, startDate: any, endDate: any, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestEmployeesWithDateRange/${actID}?startDate=${startDate}&endDate=${endDate}`, obj)
  }
  
  getAvailableEmployeesOnly(startDate: any, endDate: any, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestAvailableEmployeesOnly?startDate=${startDate}&endDate=${endDate}`, obj)
  }

  getAvailableEmployeesOnlyForAct(actID: number, startDate: any, endDate: any, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestAvailableEmployeesOnly?startDate=${startDate}&endDate=${endDate}/${actID}`, obj)
  }

  getEmployeesAndDates(maxStartDate: any, maxEndDate: any, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestAvailableEmployeesOnly?startDate=${maxStartDate}&endDate=${maxEndDate}`, obj)
  }
  
  getEmployeesAndDatesForAct(actID: number, maxStartDate: any, maxEndDate: any, obj: any)
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/suggestAvailableEmployeesOnly/${actID}?startDate=${maxStartDate}&endDate=${maxEndDate}`, obj)
  }
  
  mergeDates(obj: any) // pass the object from other methods
  {
    return this.http.post<any>(`${this.baseEmployeeSuggestionUrl}/mergeDates`, obj)
  }
  
  explainEmployeeSuggestion(empID: number, minStartDate: any, maxEndDate: any, obj: any)
  {
    let url = `${this.baseEmployeeSuggestionUrl}/explainSuggestion/${empID}`
    if (minStartDate != "" || maxEndDate != "")
    {
      if (minStartDate != "" && maxEndDate != "")
        url +=`?startDate=${minStartDate}&endDate=${maxEndDate}`
      else if (minStartDate != "")
        url +=`?startDate=${minStartDate}`
        else if (maxEndDate != "")
        url +=`?endDate=${maxEndDate}`
    }
    console.log(url)
    return this.http.post<any>(url, obj)
  }
  
  explainEmployeeSuggestionForAct(actID: number, empID: number, minStartDate: any, maxEndDate: any, obj: any)
  {
    let url = `${this.baseEmployeeSuggestionUrl}/explainSuggestion/${empID}/${actID}`
    if (minStartDate != "" || maxEndDate != "")
    {
      if (minStartDate != "" && maxEndDate != "")
        url +=`?startDate=${minStartDate}&endDate=${maxEndDate}`
      else if (minStartDate != "")
        url +=`?startDate=${minStartDate}`
        else if (maxEndDate != "")
        url +=`?endDate=${maxEndDate}`
    }
    console.log(url)
    return this.http.post<any>(url, obj)
  }

  // task templates
  getTaskTemplates()
  {
    return this.http.get<any[]>(`${this.baseTaskTemplateUrl}`)
  }

  createNewTaskTemplate(obj: any)
  {
    return this.http.post<any>(`${this.baseTaskTemplateUrl}`, obj)
  }

  getTaskTemplate(ttID: number)
  {
    return this.http.get<any>(`${this.baseTaskTemplateUrl}/${ttID}`)
  }
  
  getTaskTemplateToTask(ttID: number)
  {
    return this.http.get<any>(`${this.baseTaskTemplateUrl}/${ttID}/toTask`)
  }
  
  getTaskTemplateForActivity(ttID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskTemplateUrl}/toTask/${ttID}`)
  }

  getTaskTemplateSkills(ttID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskTemplateUrl}/${ttID}/skills`)
  }

  createTaskTemplate(obj: any)
  {
    return this.http.post<any>(`${this.baseTaskTemplateUrl}/fromTask`, obj)
  }
  createTaskTemplateWithLocation(obj: any, location:String)
  {
    return this.http.post<any>(`${this.baseTaskTemplateUrl}/fromTask/withLocation/${location}`, obj)
  }

  assignTaskTemplateSkills(ttID: number, obj: number[])
  {
    let skills: any[] = []
    obj.forEach(s => {
      skills.push({id: s, level: 4}) // assuming a level 4 for now
    })
    return this.http.post<any>(`${this.baseTaskTemplateUrl}/${ttID}/assignSkills`, skills)
  }

  getSavedLocations()
  {
    return this.http.get<SavedLocation[]>(`${this.savedLocationsUrl}`)
  }

  getLocationFromCoords(coords: string)
  {
    return this.http.get<SavedLocation>(`${this.savedLocationsUrl}/fromCoordinates/${coords}`)
  }
  
  createTaskWithLocation(obj: any)
  {
    return this.http.post<any>(`${this.baseTaskTemplateUrl}/fromTask/withLocation`, obj)
  }

  employeeTaskOnDay(empID: number, date: any)
  {
    return this.http.get<Employee>(`${this.baseEmployeeUrl}/${empID}/TasksOnDay?date1=${date}`)
  }
  
  employeeFreeOnDay(empID: number, date: any)
  {
    return this.http.get<Employee>(`${this.baseEmployeeUrl}/${empID}/FreeOnDay?date1=${date}`)
  }

  // -- REPORTS
  getReportsInProgress()
  {
    return this.http.get<any[]>(`${this.baseReportsUrl}/inProgressToday`)
  }

  getReportsCompletedToday()
  {
    return this.http.get<any[]>(`${this.baseReportsUrl}/completedToday`)
  }
  
  getReportsViaStatus(statusID: any)
  {
    return this.http.get<any[]>(`${this.baseReportsUrl}/ofStatusToday/${statusID}`)
  }
  
  getReportsDueToday()
  {
    return this.http.get<any[]>(`${this.baseReportsUrl}/DueToday`)
  }
  
  getReportsOverdueToday()
  {
    return this.http.get<any[]>(`${this.baseReportsUrl}/overdueToday`)
  }
  
  getReportsCompletedOverDueDate()
  {
    return this.http.get<any[]>(`${this.baseReportsUrl}/CompletedOverDueDate`)
  }

  // SKILL REQUESTS
  getAllUnsolvedSkillRequests()
  {
    return this.http.get<any>(`${this.baseEmployeeUrl}/getAllUnresolvedAddSkillRequests`)
  }
  
  resolveSkillRequest(req: any, res: number)
  {
    return this.http.post<any>(`${this.baseEmployeeUrl}/${res}/resolveRequestAddSkill`, req)
  }
  
  getEmployeeRating(empID: number)
  {
    return this.http.get<any>(`${this.baseEmployeeUrl}/${empID}/avgRating`)
  }
  
  getOverallEmployeeRating()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/avgOverallRatingPerMonth`)
  }

  getEmployeeRatingPerAct(empID: number, actID: number)
  {
    return this.http.get<any>(`${this.baseReportsUrl}/${empID}/avgRatingPerMonth/forActivity/${actID}`)
  }

  getAvgRatingPerAct(actID: number)
  {
    return this.http.get<any>(`${this.baseReportsUrl}/avgOverallRatingPerMonth/forActivity/${actID}`)
  }

  getEmpCountPerAct(actID: number)
  {
    return this.http.get<any>(`${this.baseActivityUrl}/avgEmployeeCountForTasksInActivity/${actID}`)
  }
  
  saveLocation(obj: any)
  {
    return this.http.post<any>(`${this.savedLocationsUrl}`, obj)
  }

  getLocations()
  {
    return this.http.get<any>(`${this.savedLocationsUrl}`)
  }

  taskUpdatesForDash(date: any)
  {
    return this.http.get<any>(`${this.baseTaskUrl}/updatesSince?time=${date}`)
  }

  getAvgTaskCompletionRD()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/AvgTaskCompletionDateRelativeToDeadlinePerMonth`)
  }

  getCompletedTasksPerMonth()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TaskCompletedPerMonth`)
  }

  getCompletedTasksPerMonthForAct(actID: number)
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TaskCompletedPerMonth/forActivity/${actID}`)
  }

  getOverdueTasksPerMonth()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TaskOverduePerMonth`)
  }

  getOverdueTasksPerMonthForAct(actID: number)
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TaskOverduePerMonth/forActivity/${actID}`)
  }

  getTopRatedEmployeesThisWeek()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TopRatedEmployeesThisWeek`)
  }

  getBottonRatedEmployeesThisWeek()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/LowestRatedEmployeesThisWeek`)
  }
  
  getTaskWithSkillRequiredNoMember()
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TasksWithSkillRequiredButNoMemberHasSkill`)
  }

  getTaskNoMemberSkill(taskID: number)
  {
    return this.http.get<any>(`${this.baseReportsUrl}/TasksWithSkillRequiredButNoMemberHasSkill/${taskID}/MissingSkills`)
  }

}
