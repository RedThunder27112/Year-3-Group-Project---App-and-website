import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { EmployeeOverviewComponent } from './employee-overview/employee-overview.component';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployeeReviewComponent } from './employee-review/employee-review.component';
import { EmployeeCheckerComponent } from './employee-checker/employee-checker.component';
import { EmployeeDetailsCoverComponent } from './employee-details-cover/employee-details-cover.component';

const routes: Routes = [
  {
    path: '', component: EmployeeManagementComponent, children: [
      { path: 'employee-overview', component: EmployeeOverviewComponent },
      { path: 'create-employee', component: CreateEmployeeComponent },
      { path: 'employee-checker', component: EmployeeCheckerComponent },
      { path: 'employee', component: EmployeeDetailsCoverComponent, children: [
        { path: 'detail/:id', component: EmployeeDetailsComponent },
        { path: 'review/:id', component: EmployeeReviewComponent },
        { path: '', redirectTo: 'detail/:id', pathMatch: 'full' },
        
      ] },

      { path: '', redirectTo: 'employee-overview', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
