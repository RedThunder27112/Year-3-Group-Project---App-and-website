import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardManagementComponent } from './dashboard-management/dashboard-management.component';
import { EmployeeRequestsComponent } from './employee-requests/employee-requests.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DchartOneComponent } from './dashboard-charts/dchart-one/dchart-one.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent, children: [
      { path: '', component:DashboardManagementComponent },
      { path: 'requests', component: EmployeeRequestsComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'charts', component: DchartOneComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
