import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsManagementComponent } from './settings-management/settings-management.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

const routes: Routes = [
  {
    path: '', component: SettingsManagementComponent, children: [
      { path: '', component: UserSettingsComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
