import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material + PrimeNG
import { NgMatModule } from './modules/ng-mat/ng-mat.module';
import { NgPrimeModule } from './modules/ng-prime/ng-prime.module';

// Other
import { FlexLayoutModule } from '@angular/flex-layout';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

// Project Modules
import { ResourceManagementModule } from './resource-management/resource-management.module';
import { TasksManagementModule } from './tasks-management/tasks-management.module';
import { EmployeesManagementModule } from './employees-management/employees-management.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MainComponent } from './components/main/main.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CreateActivityComponent } from './components/activity/create-activity/create-activity.component';
import { ProgressSpinnerComponent } from './components/controls/progress-spinner/progress-spinner.component';

import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    PageNotFoundComponent,
    ProfileComponent,
    MainComponent,
    CreateActivityComponent,
    ProgressSpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgMatModule,
    NgPrimeModule,
    ReactiveFormsModule, // needed for formgroups
    HttpClientModule, // api calling
    FlexLayoutModule,
    FormsModule,
    SweetAlert2Module.forRoot(),
    ResourceManagementModule,
    TasksManagementModule,
    EmployeesManagementModule,
    ToastrModule.forRoot()

  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
