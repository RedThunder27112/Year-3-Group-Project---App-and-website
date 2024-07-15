import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DateService } from 'src/app/helpers/GetDates';
import Swal from 'sweetalert2';
import { APIService } from '../../api.service';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss'],
  providers: [MessageService]
})
export class CreateEmployeeComponent {

  createEmployeeCodeForm!: FormGroup
  roles = ['General Employee', 'Contractor', 'Administrator'];
  todayDate = new Date()

  empID!: number;
  employeeCode!: number;
  breadcrumbItems: MenuItem[] = [];

  constructor(private api: APIService,
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder) {}

  ngOnInit() {
    this.createEmployeeCodeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contractor_expiry: [null],
      role: ['', Validators.required]
    });

    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Employees', routerLink: '../' });
    this.breadcrumbItems.push({ label: 'Add New Employee', routerLink: ['../create-employee'] });

    if(sessionStorage.getItem("emp") != null)
    {
      this.empID = JSON.parse(sessionStorage.getItem("emp")!).emp_ID!;
    }
  }
  
  getDate()
  {
    return DateService.getUTCDate(this.createEmployeeCodeForm.get("contractor_expiry")?.value)
  }

  getRegistrationCode() {
    if(this.createEmployeeCodeForm.valid) {
      let obj = {
        "code_ID": 0,
        "code_Code": null,
        "new_Emp_Is_Admin": this.createEmployeeCodeForm.get("role")?.value == 'Administrator',
        "new_Emp_Is_Contractor": this.createEmployeeCodeForm.get("role")?.value == 'Contractor',
        "contractor_Expiration_date": this.getDate(),
        "code_Creator_ID": this.empID,
        "code_Has_Been_Used": false,
        "new_Emp_Email": this.createEmployeeCodeForm.get("email")?.value
      }

      console.log(this.createEmployeeCodeForm.get("contractor_expiry")?.value)

      this.api.getRegistrationCode(obj)
      .subscribe(code => {
        this.employeeCode = code.code_Code; 
        Swal.fire(`Success!`, `A message containing the code has been forwarded to ${this.createEmployeeCodeForm.get("email")?.value}`, "success");  
        this.createEmployeeCodeForm.reset()

        console.log(this.employeeCode)
      })
  
    }
  }

  goBack() {
    this.router.navigate(['../employee-management'], {relativeTo: this.activatedRoute})
  }

}
