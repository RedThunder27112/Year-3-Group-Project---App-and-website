import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DateService } from 'src/app/helpers/GetDates';
import ValidateForm from 'src/app/helpers/validateForm';
import { APIService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})
export class CreateEmployeeComponent implements OnInit {

  createEmployeeCodeForm!: FormGroup
  roles = ['General Employee', 'Contractor', 'Administrator'];
  todayDate = new Date()

  empID!: number;
  employeeCode!: number;

  constructor(private api: APIService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder) {}

  ngOnInit() {
    this.createEmployeeCodeForm = this.fb.group({
      // name: ['', Validators.required],
      // surname: ['', Validators.required],
      email:['', [Validators.required, Validators.email]],
      contractor_expiry: [''],
      role: ['', Validators.required]
    });

    if(sessionStorage.getItem("emp") != null)
    {
      this.empID = JSON.parse(sessionStorage.getItem("emp")!).emp_ID!;
    }
  }
  
  getDate()
  {
    if(this.createEmployeeCodeForm.get("contractor_expiry")?.value == "") return null
    else return DateService.getUTCDate(this.createEmployeeCodeForm.get("contractor_expiry")?.value)
  }

  getRegistrationCode(formDirective: FormGroupDirective) {
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

      this.api.getRegistrationCode(obj)
      .subscribe(code => {
        this.employeeCode = code.code_Code; 
        Swal.fire(`Success!`, "A message containing the code has been forwarded to their inbox.", "success");  
      })
    
      formDirective.resetForm()
      this.createEmployeeCodeForm.reset()
    }
    else
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.createEmployeeCodeForm)
    }
  }

  goBack() {
    this.router.navigate(['../employee-management'], {relativeTo: this.activatedRoute})
  }
}
