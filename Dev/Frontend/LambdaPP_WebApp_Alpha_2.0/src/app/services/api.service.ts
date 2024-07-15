import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Employee from '../models/Employee';
import Task from '../models/Task';
import { FormGroup } from '@angular/forms';
import Activity from '../models/Activity';
import { Observable, map } from 'rxjs';
import Stock from '../models/Stock';
import Equipment from '../models/Equipment';
import Skill from '../models/Skill';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient) { }

  private baseEmployeeUrl: string = "https://localhost:7051/Employees"
  private baseTaskUrl: string = "https://localhost:7051/Tasks"
  private baseSkillUrl: string = "https://localhost:7051/Skills"
  private baseActivityUrl: string = "https://localhost:7051/Activities"
  private baseStockUrl: string = "https://localhost:7051/Stocks"
  private baseEquipUrl: string = "https://localhost:7051/Equipments"

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

  // get all employees
  getAllEmployees()
  {
    return this.http.get<Employee[]>(`${this.baseEmployeeUrl}/all`)
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
    return this.http.get<any[]>(`${this.baseTaskUrl}/${taskID}`)
  }

  // update task
  updateTask(task: Task)
  {
    return this.http.put<any[]>(`${this.baseTaskUrl}/${task.task_ID}`, task)
  }

  // delete task
  deleteTask(taskID: number)
  {
    return this.http.delete<any>(`${this.baseTaskUrl}/${taskID}`)
  }

  getTaskUpdates(taskID: number)
  {
    return this.http.get<any[]>(`${this.baseTaskUrl}/${taskID}/updates`)
  }

  // get skills
  getSkills()
  {
    return this.http.get<any[]>(`${this.baseSkillUrl}`)
  }

  // get activities
  getActivities()
  {
    return this.http.get<any[]>(`${this.baseActivityUrl}`) 
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

  // assign skills to task
  assignSkills(taskID: number, skillIDs: number[])
  {
    let skills: any[] = []
    skillIDs.forEach(s => {
      skills.push({id: s, level: 4}) // assuming a level 4 for now
    })

    return this.http.post<any>(`${this.baseTaskUrl}/${taskID}/assignSkills`, skills) 
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

  // create activity
  createActivity(activity: Activity)
  {
    return this.http.post<Activity>(`${this.baseActivityUrl}`, activity)
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

  createStock(stockForm: FormGroup)
  {
    let name = stockForm.get("name")?.value
    let desc = stockForm.get("desc")?.value
    let quantity = stockForm.get("quantity")?.value

    let stock = new Stock(name, desc, quantity);
    return this.http.post<any>(`${this.baseStockUrl}`, stock)
  }

  createEquip(equipForm: FormGroup)
  {
    let name = equipForm.get("name")?.value
    let desc = equipForm.get("desc")?.value
    let quantity = equipForm.get("quantity")?.value

    let equipment = new Equipment(name, desc, quantity);
    return this.http.post<any>(`${this.baseEquipUrl}`, equipment)
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
}
