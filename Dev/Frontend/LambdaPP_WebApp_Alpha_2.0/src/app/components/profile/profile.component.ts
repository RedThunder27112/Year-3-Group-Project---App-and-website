import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import Employee from 'src/app/models/Employee';
import { AuthService } from 'src/app/services/auth.service';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  showHeader: boolean = true;
  empID!: number;
  employee!: Employee

  constructor(private activatedRoute: ActivatedRoute, private es: APIService)
  {
    if(sessionStorage.getItem("emp") != null)
    {
      this.employee = JSON.parse(sessionStorage.getItem("emp")!);
      this.empID = this.employee.emp_ID!;
    }
  }

  ngOnInit(): void {
    this.es.getEmpCrendentials(this.empID)
    .subscribe(res=> {
      this.employee = res;
      console.log(this.employee)
    })
  }

}
