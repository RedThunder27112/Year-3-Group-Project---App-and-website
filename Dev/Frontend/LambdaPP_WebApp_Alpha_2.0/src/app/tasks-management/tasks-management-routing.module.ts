import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateActivityComponent } from '../components/activity/create-activity/create-activity.component';
import { TaskManagementComponent } from './task-management/task-management.component';
import { CreateTaskComponent } from './create-task/create-task.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskUpdateComponent } from './task-update/task-update.component';


const routes: Routes = [
  {
    path: 'task-management',
    title: 'WildTask',
    component: TaskManagementComponent,
  },
  {
    path: 'create-task',
    title: 'WildTask',
    component: CreateTaskComponent,
  },
  {
    path: 'create-activity',
    title: 'WildTask',
    component: CreateActivityComponent,
  },
  {
    path: 'task-detail/:taskID',
    title: 'WildTask',
    component: TaskDetailComponent,
  },
  {
    path: 'task-update/:taskID',
    title: 'WildTask',
    component: TaskUpdateComponent,
  },
  { path: '', redirectTo: 'task-management', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksManagementRoutingModule { }
