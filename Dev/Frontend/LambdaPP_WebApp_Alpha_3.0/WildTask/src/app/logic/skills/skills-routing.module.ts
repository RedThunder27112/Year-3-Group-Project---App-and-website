import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkillsManagementComponent } from './skills-management/skills-management.component';
import { SkillsOverviewComponent } from './skills-overview/skills-overview.component';
import { CreateSkillComponent } from './create-skill/create-skill.component';
import { SkillDetailsComponent } from './skill-details/skill-details.component';

const routes: Routes = [
  {
    path: '', component: SkillsManagementComponent, children: [
      { path: 'skills-overview', component: SkillsOverviewComponent },
      { path: 'add-skill', component: CreateSkillComponent },
      { path: 'skill-detail/:id', component: SkillDetailsComponent },
      { path: '', redirectTo: 'skills-overview', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillsRoutingModule { }
