import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillsRoutingModule } from './skills-routing.module';
import { SkillsManagementComponent } from './skills-management/skills-management.component';
import { SkillsOverviewComponent } from './skills-overview/skills-overview.component';
import { NgPrimeModule } from 'src/app/ng-prime.module';
import { CreateSkillComponent } from './create-skill/create-skill.component';
import { SkillDetailsComponent } from './skill-details/skill-details.component';


@NgModule({
  declarations: [
    SkillsManagementComponent,
    SkillsOverviewComponent,
    CreateSkillComponent,
    SkillDetailsComponent
  ],
  imports: [
    CommonModule,
    SkillsRoutingModule,
    NgPrimeModule
  ]
})
export class SkillsModule { }
