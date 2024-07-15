import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import Employee from '../models/Employee';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl:string = "https://localhost:7051/Employees"
  constructor(private http: HttpClient) { }

  // register function
  register(user: FormGroup)
  {
    let name = user.get("name")?.value
    let surname = user.get("surname")?.value
    let email = user.get("email")?.value
    let password = user.get("password")?.value
    let admin = new Employee(name, surname, email, password, "Admin")

    return this.http.post<Employee>(`${this.baseUrl}`, admin)
  }

  // login function
  login(loginObj: FormGroup)
  {
    return this.http.get<number>(`${this.baseUrl}/?Username=${loginObj.get("email")?.value}&Password=${loginObj.get("password")?.value}`)
  }
}
