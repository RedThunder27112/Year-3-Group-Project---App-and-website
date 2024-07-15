import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { FormGroup } from '@angular/forms';
import Employee from '../models/Employee';

@Injectable({ 
  providedIn: 'root'
})
export class AuthService {

  private baseUrl:string = "https://localhost:7051/Employees"
  constructor(private http: HttpClient) { }

  signup(userObj: FormGroup)
  {
    let name = userObj.get("Name")?.value
    let surname = userObj.get("Surname")?.value
    let username = userObj.get("Username")?.value
    let password = userObj.get("Password")?.value

    let admin = new Employee(name, surname, username, password)

    return this.http.post<Employee>(`${this.baseUrl}`, admin)
  }

  // login function
  login(loginObj: FormGroup)
  {
    return this.http.get<any>(`${this.baseUrl}/?Username=${loginObj.get("Username")?.value}&Password=${loginObj.get("Password")?.value}`)
  }
}
