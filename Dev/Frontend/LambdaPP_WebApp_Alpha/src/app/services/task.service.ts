import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { FormGroup } from '@angular/forms';
import Employee from '../models/Employee';
import Task from '../models/Task';
import { Observable } from 'rxjs';
import Skill from '../models/Skill';

@Injectable({ 
  providedIn: 'root'
})
export class TaskService {

  private taskUrl:string = "https://localhost:7051/Tasks"
  private skillsUrl:string = "https://localhost:7051/Skills"
  private employeesUrl:string = "https://localhost:7051/Employees"

  constructor(private http: HttpClient) { }

  //createTask(taskObj: FormGroup)
  createTask(task: Task): Observable<any>
  {
    /*let name = taskObj.get("Name")?.value
    let act_ID = taskObj.get("Activity")?.value
    let description = taskObj.get("Description")?.value
    let surname = userObj.get("Surname")?.value
    let username = userObj.get("Username")?.value
    let password = userObj.get("Password")?.value

    let admin = new Employee(name, surname, username, password)
    */

    //let task = new Task(name,act_ID,description);
    return this.http.post(`${this.taskUrl}`, task)
  }

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.skillsUrl);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeesUrl + "/all");
  }

  assignEmployees(taskID: Number, employeeIds: Number[]){
    return this.http.post(this.taskUrl + "/" + taskID + "/assignEmployees", employeeIds)
  }
  
}
