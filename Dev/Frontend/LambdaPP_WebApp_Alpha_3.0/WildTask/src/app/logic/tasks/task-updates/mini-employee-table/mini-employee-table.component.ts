import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../../api.service';
import Employee from '../../../models/Employee';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-mini-employee-table',
  templateUrl: './mini-employee-table.component.html',
  styleUrls: ['./mini-employee-table.component.scss']
})
export class MiniEmployeeTableComponent {

  employees: Employee[] = [];
  task!: any;
  roles = ["Employee", "Administrator", "Contractor"]

  supervisor!: any;

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              public ref: DynamicDialogRef, 
              public config: DynamicDialogConfig) {}

  ngOnInit(): void 
  {
    this.employees = this.config.data.employees;
    this.task = this.config.data.task;

    this.api.getTaskSupervisor(this.task.task_ID)
    .subscribe(res => {
      this.supervisor = res;
    })
  }

  betterDate(dateStr: string)
  {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString();
    return formattedDate;
  }

  goToCreateEmployee() {
    this.router.navigate(['../add-employee'], {relativeTo: this.activatedRoute})
  }

  goToEmployeeDetail(row: Employee) {
    this.router.navigate(['main/employees/employee-detail', row.emp_ID])
  }
}
