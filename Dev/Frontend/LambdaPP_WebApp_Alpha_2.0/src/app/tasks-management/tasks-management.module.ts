import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksManagementRoutingModule } from './tasks-management-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgMatModule } from '../modules/ng-mat/ng-mat.module';
import { CreateTaskComponent } from './create-task/create-task.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskUpdateComponent } from './task-update/task-update.component';
import { TaskManagementComponent } from './task-management/task-management.component';
import { TasksComponent } from './tasks/tasks.component';
import { NgPrimeModule } from '../modules/ng-prime/ng-prime.module';


@NgModule({
  declarations: [
    CreateTaskComponent,
    TaskDetailComponent,
    TaskUpdateComponent,
    TaskManagementComponent,
    TasksComponent
  ],
  imports: [
    CommonModule,
    TasksManagementRoutingModule,
    NgMatModule,
    NgPrimeModule,
    ReactiveFormsModule, // needed for formgroups
    HttpClientModule, // api calling
    FlexLayoutModule,
    FormsModule,
    SweetAlert2Module.forRoot()
  ]
})
export class TasksManagementModule { }
