import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../api.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-skill-details',
  templateUrl: './skill-details.component.html',
  styleUrls: ['./skill-details.component.scss']
})
export class SkillDetailsComponent {

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) {}

  skill!: any;
  employees!: any;

  roles = ["Employee", "Administrator", "Contractor"]

  breadcrumbItems: MenuItem[] = [];

  ngOnInit(): void {
    let skillID = this.activatedRoute.snapshot.paramMap.get('id')

    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Skills', routerLink: '../../' });
    this.breadcrumbItems.push({ label: 'Skill Details', routerLink: ['../', skillID]})
    
    this.api.getSkill(parseInt(skillID!))
    .subscribe(res => {
      this.skill = res;
    })

    this.api.getEmployeesWithSameSkill(parseInt(skillID!))
    .subscribe(res => {

      // adding a role
      res.forEach((e: any) => {
        if(e.emp_IsAdmin) { e.emp_Role = "Administrator" }
        else if(e.emp_IsContractor) { e.emp_Role = "Contractor" }
        else { e.emp_Role = "Employee" }
      })

      // adding an image
      res.forEach((e: any) => {
        this.api.getProfilePic(e.emp_ID!)
        .subscribe(url => {
          e.emp_ID_Image = url;
        })
      })

      this.employees = res;
    })
  }

  goBack() {
    this.router.navigate(['../../skills-overview'], {
      relativeTo: this.activatedRoute,
    })
  }
}