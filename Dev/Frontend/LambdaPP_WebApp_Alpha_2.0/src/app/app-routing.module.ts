import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MainComponent } from './components/main/main.component';
import { StockComponent } from './resource-management/stock/stock.component';
import { TasksComponent } from './tasks-management/tasks/tasks.component';
import { EmployeesComponent } from './employees-management/employees/employees.component';

const routes: Routes = [
  { path: 'login', title: 'WildTask', component: LoginComponent },
  { path: 'register', title: 'WildTask', component: RegisterComponent },
  {
    path: 'main',
    title: 'WildTask',
    component: MainComponent,
    children: [
      { path: 'dashboard', title: 'WildTask', component: DashboardComponent },
      {
        path: 'tasks',
        title: 'WildTask',
        component: TasksComponent,
        loadChildren: () =>
          import('./tasks-management/tasks-management.module').then(
            (x) => x.TasksManagementModule
          )
      },
      {
        path: 'employees',
        title: 'WildTask',
        component: EmployeesComponent,
        loadChildren: () =>
          import('./employees-management/employees-management.module').then(
            (x) => x.EmployeesManagementModule
          )
      },
      {
        path: 'warehouse',
        title: 'WildTask',
        component: StockComponent,
        loadChildren: () =>
          import('./resource-management/resource-management.module').then(
            (x) => x.ResourceManagementModule
          )
      },
      {
        path: 'profile',
        title: 'WildTask',
        component: ProfileComponent,
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // last one
  // { path: '404', title: 'WildTask', component: PageNotFoundComponent},
  // { path: '**', redirectTo: '404', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
