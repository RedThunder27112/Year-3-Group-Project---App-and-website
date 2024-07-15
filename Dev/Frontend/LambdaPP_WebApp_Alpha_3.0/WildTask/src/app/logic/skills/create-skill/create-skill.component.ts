import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { APIService } from '../../api.service';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-skill',
  templateUrl: './create-skill.component.html',
  styleUrls: ['./create-skill.component.scss'],
  providers: [MessageService]
})
export class CreateSkillComponent implements OnInit {

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute, 
              private fb: FormBuilder,
              private messageService: MessageService) { }

  breadcrumbItems: MenuItem[] = [];

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Skills', routerLink: '../' });
    this.breadcrumbItems.push({ label: 'Add New Skill', routerLink: ['../add-skill']})        
  } 

  skillName!: any;
  skillDesc!: any;

  createSkill() {

    if(this.skillName != null && this.skillDesc != null)
    {
      let skill = {
        skill_ID: 0,
        skill_Name: this.skillName,
        skill_Description: this.skillDesc,
        skill_Enabled: true
      }
  
      this.api.createSkill(skill)
      .subscribe(res => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Skill added successfully", life: 3000 });
        this.skillName = "";
        this.skillDesc = "";
      })
    }
  }
}
