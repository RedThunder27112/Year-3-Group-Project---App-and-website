import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { EmployeeOverviewComponent } from './employee-overview/employee-overview.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';

import { NgPrimeModule } from 'src/app/ng-prime.module';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeeCheckerComponent } from './employee-checker/employee-checker.component';
import { EmployeeReviewComponent } from './employee-review/employee-review.component';
import { EmployeeDetailsCoverComponent } from './employee-details-cover/employee-details-cover.component';

@NgModule({
  declarations: [
    EmployeeManagementComponent,
    EmployeeOverviewComponent,
    EmployeeDetailsComponent,
    CreateEmployeeComponent,
    EmployeeReviewComponent,
    EmployeeCheckerComponent,
    EmployeeDetailsCoverComponent
  ],
  imports: [
    CommonModule,
    EmployeesRoutingModule,
    NgPrimeModule
  ]
})
export class EmployeesModule { }
