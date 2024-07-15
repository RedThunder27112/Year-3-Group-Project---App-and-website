import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';

const routes: Routes = [

  {
    path: 'employee-management',
    title: 'WildTask',
    component: EmployeeManagementComponent,
  },
  {
    path: 'add-employee',
    title: 'WildTask',
    component: CreateEmployeeComponent,
  },
  {
    path: 'employee-detail/:empID',
    title: 'WildTask',
    component: EmployeeDetailComponent,
  },
  { path: '', redirectTo: 'employee-management', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesManagementRoutingModule { }
