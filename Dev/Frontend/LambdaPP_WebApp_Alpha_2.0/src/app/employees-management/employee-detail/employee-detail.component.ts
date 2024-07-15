import { Component, OnInit} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Employee from 'src/app/models/Employee';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {

  empID!: number;
  employee!: Employee;

  constructor(private api: APIService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      val=> {
        this.empID = val['empID']
        this.api.getEmpCrendentials(this.empID)
        .subscribe(res => {
          this.employee = res;
        })
      }
    )
  }

  goBack() {
    this.router.navigate(['../../employee-management'], {relativeTo: this.activatedRoute})
  }
}
