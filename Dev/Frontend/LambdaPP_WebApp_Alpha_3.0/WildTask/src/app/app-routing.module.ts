import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { TaskManagementComponent } from './logic/tasks/task-management/task-management.component';
import { InventoryManagementComponent } from './logic/inventory/inventory-management/inventory-management.component';
import { EmployeeManagementComponent } from './logic/employees/employee-management/employee-management.component';
import { SkillsManagementComponent } from './logic/skills/skills-management/skills-management.component';
import { authGuard } from './auth.guard';
import { ProfileManagementComponent } from './logic/profile/profile-management/profile-management.component';
import { DashboardComponent } from './logic/dashboard/dashboard/dashboard.component';
import { SettingsManagementComponent } from './logic/settings/settings-management/settings-management.component';

const routes: Routes = [
  {
    path: 'main', component: AppLayoutComponent, 
    children: [
      { 
        path: 'tasks', 
        component: TaskManagementComponent,
        loadChildren: () => import('./logic/tasks/tasks.module').then(m => m.TasksModule),
        canActivate: [authGuard]

      },
      { 
        path: 'dashboard',
        component: DashboardComponent,
        loadChildren: () => import('./logic/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [authGuard]
      },
      { 
        path: 'inventory',
        component: InventoryManagementComponent,
        loadChildren: () => import('./logic/inventory/inventory.module').then(m => m.InventoryModule),
        canActivate: [authGuard]
      },
      { 
        path: 'employees',
        component: EmployeeManagementComponent,
        loadChildren: () => import('./logic/employees/employees.module').then(m => m.EmployeesModule),
        canActivate: [authGuard]
      },
      { 
        path: 'skills',
        component: SkillsManagementComponent,
        loadChildren: () => import('./logic/skills/skills.module').then(m => m.SkillsModule),
        canActivate: [authGuard]
      },
      { 
        path: 'profile',
        component: ProfileManagementComponent,
        loadChildren: () => import('./logic/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [authGuard]
      },
      { 
        path: 'settings',
        component: SettingsManagementComponent,
        loadChildren: () => import('./logic/settings/settings.module').then(m => m.SettingsModule),
        canActivate: [authGuard]
      },
      {
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full'
      }
    ],
    canActivate: [authGuard]  
  },
  {
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
