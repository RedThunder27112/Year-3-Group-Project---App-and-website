import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagementComponent } from './task-management/task-management.component';
import { TaskOverviewComponent } from './task-overview/task-overview.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { TaskUpdatesComponent } from './task-updates/task-updates.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { TaskCreationComponent } from './task-creation/task-creation.component';
import { TaskSetupComponent } from './task-setup/task-setup.component';
import { TaskTemplatesComponent } from './task-templates/task-templates.component';
import { CreateTaskComponent } from './task-creation/create-task/create-task.component';
import { TaskMapComponent } from './task-map/task-map.component';
import { TaskSitesComponent } from './task-sites/task-sites.component';

const routes: Routes = [
  {
    path: '', component: TaskManagementComponent, children: [
      { path: 'task-overview', component: TaskOverviewComponent },
      { path: 'task-setup', component: TaskSetupComponent },
      { path: 'task-steps', component: TaskCreationComponent },
      { path: 'create-task', component: CreateTaskComponent },
      { path: 'task-templates', component: TaskTemplatesComponent },
      { path: 'task-templates/:edit', component: TaskTemplatesComponent },
      { path: 'create-activity', component: CreateActivityComponent },
      { path: 'create-activity/:edit', component: CreateActivityComponent },
      { path: 'task-map', component: TaskMapComponent },
      { path: 'task-sites', component: TaskSitesComponent },
      { path: 'task-detail/:id', component: TaskDetailsComponent },
      { path: 'task-updates/:id', component: TaskUpdatesComponent },
      { path: 'task-edit/:id', component: TaskEditComponent },
      { path: 'task-edit/:id/:template', component: TaskEditComponent },
      { path: '', redirectTo: 'task-overview', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
