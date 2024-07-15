import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService} from '../../api.service'
import Employee from '../../models/Employee';
import Skill from '../../models/Skill';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import SkillWithLevel from '../../models/SkillWithLevel';
import IdWithLevel from '../../models/IdWithLevel';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  providers: [MessageService]
})
export class EditProfileComponent  implements OnInit{
  employee!: Employee;
  skills: SkillWithLevel[] = [];
  updateProfileForm !: FormGroup;

  
  // -- prime
  selected_skills: SkillWithLevel[] = [];
  none_selected = false;
  

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private messageService: MessageService) {}
  ngOnInit(): void 
  {
    if (sessionStorage.getItem("emp") == null) {
      sessionStorage.clear()
      this.router.navigate(['login'])
      return;
    }
    this.employee = JSON.parse(sessionStorage.getItem("emp")!);

    this.api.getSkills().subscribe((res) => {
      this.skills = this.convertToSkillsWithLevels(res)

      this.api.getEmployeeSkills(this.employee.emp_ID!).subscribe((res) => {
        console.log("Employee skills: ", res)
        console.log("All skills: ", this.skills)
        this.selected_skills = res;
        this.selected_skills.forEach(element => {
          let skillInList = this.skills.find(skill => skill.skill.skill_ID === element.skill.skill_ID)
          if (skillInList != undefined)
          {
            console.log("skill found!", skillInList)
            skillInList.level = element.level
          }
        });
      });
    });
    
    
    

    this.updateProfileForm = this.fb.group({
      empName: [this.employee.emp_Name, Validators.required],
      surName: [this.employee.emp_Sur, Validators.required],
      empEmail: [this.employee.emp_Username, Validators.required],
    })

  }

  convertToSkillsWithLevels(skills: Skill[])
  {
    let swlList: SkillWithLevel[] = [];
    skills.forEach(element => {
      let swl = new SkillWithLevel();
      swl.skill = element;
      swlList.push(swl)
    });
    return swlList;
  }

  updateProfile() {
    if (this.updateProfileForm.valid) {
      let name = this.updateProfileForm.get('empName')?.value;
      let sur = this.updateProfileForm.get('surName')?.value;
      let empEmail = this.updateProfileForm.get('empEmail')?.value;
      let selected_skills = this.trimSkills()

      let newEmployee = new Employee(name, sur, empEmail, null, "Administrator")
      newEmployee.emp_ID = this.employee.emp_ID

      this.api.updateEmployee(newEmployee).subscribe((emp) => {
        this.api.assignEmployeeSkills(emp.emp_ID!, selected_skills).subscribe((response2) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Profile updated Successfully" });
          sessionStorage.setItem("emp", JSON.stringify(emp))
          setTimeout((res: any) => {
            this.router.navigate(['../../profile'], { relativeTo: this.activatedRoute })
          }, 2000)
        })
      });
    }
  }

  updateSkill(skill: SkillWithLevel, value: string)
  {
    console.log("skill level changed:", value)
    console.log("for skill: ", skill)
    skill.level = parseInt(value)
  }

  trimSkills()
  {
    let trimmedSkills: IdWithLevel[] = [];
    this.skills.forEach(element => {
      if (element.level > 0 && element.skill.skill_ID != null) {
        let idwithlevel = new IdWithLevel()
        idwithlevel.id = element.skill.skill_ID
        idwithlevel.level = element.level
        trimmedSkills.push(idwithlevel)
      }
    });
    return trimmedSkills;
  }

}
