import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileManagementComponent } from './profile-management/profile-management.component';

const routes: Routes = [
  {
    path: '', component: ProfileManagementComponent, children: [
      { path: '', component: ViewProfileComponent },
      { path: 'edit', component: EditProfileComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
