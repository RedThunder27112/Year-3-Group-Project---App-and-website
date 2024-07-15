import { Component, OnInit } from '@angular/core';
import Employee from 'src/app/models/Employee';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  employee!: Employee
  empID!: number;

  constructor(private api: APIService)
  {
    if(sessionStorage.getItem("emp") != null)
    {
      this.employee = JSON.parse(sessionStorage.getItem("emp")!);
      this.empID = this.employee.emp_ID!;
    }
  }

  ngOnInit(): void {
    this.getEmployeeImage()
  }

  clearSession() {
    sessionStorage.clear()
  }

  getEmployeeImage() {
    this.api.getProfilePic(this.empID)
    .subscribe(url => {
      this.employee.emp_ID_Image = url;
    })
  }
}
