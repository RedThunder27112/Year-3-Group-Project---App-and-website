import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// layout
import { AppLayoutModule } from './layout/app.layout.module';
// authentication
import { AuthModule } from './logic/auth/auth.module';
// dashboard
import { DashboardModule } from './logic/dashboard/dashboard.module';
// tasks
import { TasksModule } from './logic/tasks/tasks.module';
// inventory
import { InventoryModule } from './logic/inventory/inventory.module';
// employees
import { EmployeesModule } from './logic/employees/employees.module';
// profile
import { ProfileModule } from './logic/profile/profile.module';
// prime
import { NgPrimeModule } from './ng-prime.module';
// swwetalert2
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
// google maps
import { GoogleMapsModule } from '@angular/google-maps'
//pdfs
import { PdfViewerModule } from 'ng2-pdf-viewer';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppLayoutModule,
    AuthModule,
    TasksModule,
    DashboardModule,
    InventoryModule,
    EmployeesModule,
    ProfileModule,
    NgPrimeModule,
    GoogleMapsModule,
    PdfViewerModule,
    SweetAlert2Module.forRoot(),
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
