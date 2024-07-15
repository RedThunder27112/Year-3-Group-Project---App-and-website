import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService} from '../../api.service'
import Employee from '../../models/Employee';
import Skill from '../../models/Skill';
import SkillWithLevel from '../../models/SkillWithLevel';


@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent  implements OnInit{
  employee!: Employee;
  skills: SkillWithLevel[] = [];

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) {}
  ngOnInit(): void 
  {
    if (sessionStorage.getItem("emp") == null) {
      sessionStorage.clear()
      this.router.navigate(['login'])
      return;
    }
     this.employee = JSON.parse(sessionStorage.getItem("emp")!);

     // adding an image
   
     this.api.getProfilePic(this.employee.emp_ID!)
     .subscribe(url => {
       this.employee.emp_ID_Image = url;
     })

    this.api.getEmployeeSkills(this.employee.emp_ID!).subscribe((res) => {
      this.skills = res;
    });
  }

  editProfile() {
    this.router.navigate(['edit-profile'], {
      relativeTo: this.activatedRoute,
    });
  }


}

