import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsManagementComponent } from './settings-management/settings-management.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { NgPrimeModule } from 'src/app/ng-prime.module';



@NgModule({
  declarations: [
    SettingsManagementComponent,
    UserSettingsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    NgPrimeModule
  ]
})
export class SettingsModule { }
