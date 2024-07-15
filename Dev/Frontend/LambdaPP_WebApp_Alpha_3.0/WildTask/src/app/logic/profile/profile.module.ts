import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { NgPrimeModule } from '../../ng-prime.module';
import { ProfileManagementComponent } from './profile-management/profile-management.component';


@NgModule({
  declarations: [
    ViewProfileComponent,
    EditProfileComponent,
    ProfileManagementComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NgPrimeModule
  ]
})
export class ProfileModule { }
