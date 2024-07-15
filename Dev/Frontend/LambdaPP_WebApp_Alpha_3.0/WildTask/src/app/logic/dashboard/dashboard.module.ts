import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardManagementComponent } from './dashboard-management/dashboard-management.component';
import { NgPrimeModule } from 'src/app/ng-prime.module';
import { EmployeeRequestsComponent } from './employee-requests/employee-requests.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CalendarComponent } from './calendar/calendar.component';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DchartOneComponent } from './dashboard-charts/dchart-one/dchart-one.component';

@NgModule({
  declarations: [
    DashboardManagementComponent,
    EmployeeRequestsComponent,
    DashboardComponent,
    CalendarComponent,
    DchartOneComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgPrimeModule,

    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
  ]
})
export class DashboardModule { }
