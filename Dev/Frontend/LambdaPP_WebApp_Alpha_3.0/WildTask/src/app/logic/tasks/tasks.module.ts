import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksRoutingModule } from './tasks-routing.module';
import { TaskManagementComponent } from './task-management/task-management.component';
import { CreateTaskComponent } from './task-creation/create-task/create-task.component';
import { TaskOverviewComponent } from './task-overview/task-overview.component';
import { NgPrimeModule } from '../../ng-prime.module';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { TaskUpdatesComponent } from './task-updates/task-updates.component';
import { MiniEmployeeTableComponent } from './task-updates/mini-employee-table/mini-employee-table.component';
import { TaskCreationComponent } from './task-creation/task-creation.component';
import { RouterModule } from '@angular/router';
import { TaskSetupComponent } from './task-setup/task-setup.component';
import { TaskConfirmationComponent } from './task-creation/task-confirmation/task-confirmation.component';
import { taskConfirmationGuard } from './taskConfirmation.guard';
import { TaskTemplatesComponent } from './task-templates/task-templates.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { TaskMapComponent } from './task-map/task-map.component';
import { TaskSitesComponent } from './task-sites/task-sites.component';


@NgModule({
  declarations: [
    TaskManagementComponent,
    CreateTaskComponent,
    TaskOverviewComponent,
    TaskDetailsComponent,
    CreateActivityComponent,
    TaskUpdatesComponent,
    MiniEmployeeTableComponent,
    TaskCreationComponent,
    TaskSetupComponent,
    TaskConfirmationComponent,
    TaskTemplatesComponent, 
    TaskEditComponent, TaskMapComponent, TaskSitesComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule,
    NgPrimeModule,
    RouterModule.forChild([
			{
				path: 'task-steps', component: TaskCreationComponent, children: [
					{ path: '', redirectTo: 'create-task', pathMatch: 'full' },
					{ path: 'create-task', component: CreateTaskComponent },
					{ path: 'create-task/:id', component: CreateTaskComponent },
					{ path: 'task-confirmation', component: TaskConfirmationComponent },
          // , canActivate: [taskConfirmationGuard]
				]
			}
		])
  ]
})
export class TasksModule { }
