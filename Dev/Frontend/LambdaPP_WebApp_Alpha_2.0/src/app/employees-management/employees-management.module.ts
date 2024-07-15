import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesManagementRoutingModule } from './employees-management-routing.module';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { EmployeesComponent } from './employees/employees.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgMatModule } from '../modules/ng-mat/ng-mat.module';

@NgModule({
  declarations: [
    CreateEmployeeComponent,
    EmployeeDetailComponent,
    EmployeeManagementComponent,
    EmployeesComponent
  ],
  imports: [
    CommonModule,
    EmployeesManagementRoutingModule,

    NgMatModule,
    ReactiveFormsModule, // needed for formgroups
    HttpClientModule, // api calling
    FlexLayoutModule,
    FormsModule,
    SweetAlert2Module.forRoot(),
  ]
})
export class EmployeesManagementModule { }
