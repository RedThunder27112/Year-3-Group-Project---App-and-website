import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../api.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import Employee from '../../models/Employee';

@Component({
  selector: 'app-employee-overview',
  templateUrl: './employee-overview.component.html',
  styleUrls: ['./employee-overview.component.scss'],
  providers: [DialogService]
})
export class EmployeeOverviewComponent {
  
  employees: Employee[] = [];
  roles = ["Employee", "Administrator", "Contractor"]

  ref: DynamicDialogRef | undefined;

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private dialogService: DialogService) {}

  ngOnInit(): void 
  {
    this.api.getAllEmployees()
    .subscribe(res => {
      
      // adding a role
      res.forEach(e => {
        if(e.emp_IsAdmin) { e.emp_Role = "Administrator" }
        else if(e.emp_IsContractor) { e.emp_Role = "Contractor" }
        else { e.emp_Role = "Employee" }
      })

      // adding an image
      res.forEach(e => {
        this.api.getProfilePic(e.emp_ID!)
        .subscribe(url => {
          e.emp_ID_Image = url;
        })
      })

      this.employees = res;
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
    this.router.navigate(['../employee-detail', row.emp_ID], {relativeTo: this.activatedRoute})
  }

  // show() {
  //   this.ref = this.dialogService.open(MiniCalenderComponent, {
  //     header: 'The Team',
  //     width: '70%',
  //     contentStyle: { overflow: 'auto' },
  //     baseZIndex: 10000,
  //     maximizable: true,
  //     data: { employees: this.employees, task: this.myTask }
  //   });
  // }
}
