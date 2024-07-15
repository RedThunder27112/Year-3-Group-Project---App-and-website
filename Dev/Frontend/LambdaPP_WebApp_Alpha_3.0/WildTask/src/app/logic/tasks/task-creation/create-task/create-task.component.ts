import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';

import Employee from '../../../models/Employee';
import Task from '../../../models/Task';
import Skill from '../../../models/Skill';
import { TaskCreationService } from '../task-creation.service';
import { DateService } from '../../../../helpers/GetDates';
import Swal from 'sweetalert2';
import { addDays } from 'date-fns';
import Activity from '../../../models/Activity';
import SavedLocation from '../../../models/SavedLocation';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss'],
  providers: [MessageService]
})
export class CreateTaskComponent implements OnInit {

  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private share: TaskCreationService
  ) {}

  check = false;

  todayDate = new Date();
  startDate: Date|undefined;
  
  act: Activity|undefined;

  employees: Employee[] = [];
  skills!: any;
  selectedSkills: any[] = [];
  activities: any[] = [];

  myEmployees: Employee[] = [];
  
  createTaskForm !: FormGroup;

  breadcrumbItems: MenuItem[] = [];

  locations: SavedLocation[] = []

  // -- prime
  selected_employees: Employee[] = [];
  none_selected = false;
  
  roles = ["Employee", "Administrator", "Contractor"]

  // task templates

  taskTempID!: number | null;
  taskTempData!: any;
  taskTempSkills: Skill[] = [];

  createTaskTemp()
  {
    if(this.createTaskForm.valid)
    {
      let formActivity = this.createTaskForm.get('activity')?.value;
      let name = this.createTaskForm.get('taskname')?.value;
      let desc = this.createTaskForm.get('taskdesc')?.value;
      let startdate = this.createTaskForm.get('startdate')?.value;
      let deadline = this.createTaskForm.get('deadline')?.value;
      let selected_skills = this.createTaskForm.get('skills')?.value;
      let location = this.createTaskForm.get('location')?.value;

      let task = new Task(formActivity.act_ID, name, desc, startdate, deadline);

      // get skill IDs
      let skillIDs: number[] = [];
      selected_skills.forEach((s: Skill) => {
        skillIDs.push(s.skill_ID!);
      });

      if (location != undefined && location != "") 
      {
        console.log("creating template with location")
        this.api.createTaskTemplateWithLocation(task, location.loc_Coordinates).subscribe((tasktemp) => {
          console.log("taskTemp",task)
          this.api.assignTaskTemplateSkills(tasktemp.template_ID, skillIDs).subscribe(res => {
            console.log("Skills")
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Template Created Successfully"});
          })        
        });
      }
      else
      {
        this.api.createTaskTemplate(task).subscribe((tasktemp) => {
          this.api.assignTaskTemplateSkills(tasktemp.template_ID, skillIDs).subscribe(res => {
            console.log("Skills")
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Template Created Successfully"});
          })        
        });
      }

    }
  }
  
  // ---

  ngOnInit(): void {

    if(this.router.url == '/main/tasks/create-task') 
    {
      this.check = true;

      this.breadcrumbItems = [];
      this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../' });
      this.breadcrumbItems.push({ label: 'Task Setup', routerLink: ['../task-setup'] });
      this.breadcrumbItems.push({ label: 'Task Templates', routerLink: ['../task-templates'] });
      this.breadcrumbItems.push({ label: 'Create Task Template', routerLink: ['../../create-task'] });
    } 
    else 
    {
      this.check = false;
    }

    this.getDataFromAPI();

    this.createTaskForm = this.fb.group({
      activity: ['', Validators.required],
      taskname: ['', Validators.required],
      taskdesc: ['', Validators.required],
      startdate: ['', Validators.required],
      deadline: ['', Validators.required],
      skills: ['', Validators.required],
      tasksupervisor: [''],
      location: [''],
    })

    this.createTaskForm
    .get('skills')
    ?.valueChanges.subscribe((skill) => {
      this.selectedSkills = skill
      this.recommendEmployeesOnSkill(skill)
    });

    this.createTaskForm
    .get('activity')
    ?.valueChanges.subscribe((act) => {
      this.recommendEmployeesOnSkill(this.selectedSkills)
      this.act = act
    });

    this.createTaskForm
    .get('startdate')
    ?.valueChanges.subscribe((newDate) => {
      //move the deadline according to however many days the start date was moved
      if (this.startDate == undefined)
        this.startDate = newDate
      else{
        console.log("new start date!")
        let DateDif = this.compareDays(newDate, this.startDate);
        console.log(DateDif);
        this.createTaskForm.get('deadline')?.setValue(addDays(this.createTaskForm.get('deadline')?.value, DateDif))
        this.startDate = newDate
      }

      this.recommendEmployeesOnSkill(this.selectedSkills)
    });

    this.createTaskForm
    .get('deadline')
    ?.valueChanges.subscribe((act) => {
      this.recommendEmployeesOnSkill(this.selectedSkills)
    });


    this.taskTempID = parseInt(this.activatedRoute.snapshot.paramMap.get('id')!)
    if(!Number.isNaN(this.taskTempID))
    {
      let ttActivity: any;

      this.api.getTaskTemplateToTask(this.taskTempID)
      .subscribe(res => {
        this.taskTempData = res

        this.api.getTaskTemplateSkills(this.taskTempID!)
          .subscribe(res => {

            res.forEach(sk => {
              this.taskTempSkills.push(sk.skill)
            })

            this.api.getActivity(this.taskTempData.act_ID)
              .subscribe(act => {
                ttActivity = act;

                this.api.getTaskTemplate(this.taskTempID!).subscribe(temp => {
                  if (temp.location != undefined && temp.location != null)
                  {
                    console.log("location loading in from template")
                    this.api.getLocationFromCoords(temp.location).subscribe((res) => {
                      console.log("location from coords:", res)
                      this.createTaskForm.setValue({
                        "activity": ttActivity,
                        "taskname": this.taskTempData.task_Name,
                        "taskdesc": this.taskTempData.task_Description,
                        "startdate": new Date(this.taskTempData.task_Date_Started),
                        "deadline": new Date(this.taskTempData.task_Deadline),
                        "skills": this.taskTempSkills,
                        "tasksupervisor": "",
                        "location" : res
                      })
                    })
                  }
                  else
                  {
                    console.log("no location to load",temp)
                    this.createTaskForm.setValue({
                      "activity": ttActivity,
                      "taskname": this.taskTempData.task_Name,
                      "taskdesc": this.taskTempData.task_Description,
                      "startdate": new Date(this.taskTempData.task_Date_Started),
                      "deadline": new Date(this.taskTempData.task_Deadline),
                      "skills": this.taskTempSkills,
                      "tasksupervisor": "",
                      "location" : ""
                    })
                  }
                })
                
                

               
                this.startDate =  new Date(this.taskTempData.task_Date_Started);
      
                let obj = {
                  "form": this.createTaskForm.value,
                  "employees": null
                }

                this.share.setData(obj);
              })
          })
      })
    }
    else
    {
      this.share.currentData.subscribe((data: any) => {
        if(data != "")
        {
  
          this.createTaskForm.setValue({
            "activity": data.form.activity,
            "taskname": data.form.taskname,
            "taskdesc": data.form.taskdesc,
            "startdate": data.form.startdate,
            "deadline": data.form.deadline,
            "skills": data.form.skills,
            "tasksupervisor": data.form.tasksupervisor,
            "location": data.form.location
          })
  
          this.selected_employees = data.employees
        } 
      })
    }

  }

  getDataFromAPI() {
    if (this.employees.length == 0)
    this.api.getAllEmployees().subscribe((employees) => {

      // adding a role
      employees.forEach(e => {
        if(e.emp_IsAdmin) { e.emp_Role = "Administrator" }
        else if(e.emp_IsContractor) { e.emp_Role = "Contractor" }
        else { e.emp_Role = "Employee" }
      })

      // adding an image
      employees.forEach(e => {
        this.api.getProfilePic(e.emp_ID!)
        .subscribe(url => {
          e.emp_ID_Image = url;
        })
      })

      this.employees = employees;
      this.myEmployees = this.employees
    
    });

    this.api.getSkills().subscribe((res) => {
      this.skills = res;
    });

    this.api.getActivities().subscribe((res) => {
      this.activities = res;
    });

    this.api.getSavedLocations().subscribe((res) => {
      this.locations = res;
      console.log(res);
    })
  }

  goBack() {
    this.router.navigate(['../task-management'], {
      relativeTo: this.activatedRoute,
    });
  }
  
  // --- prime stuff
  onRowSelect(event: any) {
    this.none_selected = false;
  }

  onRowUnselect(event: any) {
    if(this.selected_employees.length == 0)
    {
      this.none_selected = true;
    }
  }

  clear(table: Table) {
    table.clear();
  }
  // ----

  // -- employee recommendations
  recommended_employees: Employee[] = [];
  recommendEmployeesOnSkill(skill: Skill[]) {
    if(skill != undefined)
    {
      let skills = skill;
  
      let skillIDs: number[] = [];
      Array.from(skills).forEach(s => {
        skillIDs.push(s.skill_ID!)
      })
      
      if(skillIDs.length > 0)
      {
        let mySkills: any = []
        skillIDs.forEach(e => {
          let obj = {
            id: e,
            level: 3 //assigning a temporary rating of 3 as the rating we're looking for. So above 3 is good, below is bad
          }

          mySkills.push(obj)
        })

        let activity = this.createTaskForm.get('activity');
        let startdateDate = this.createTaskForm.get('startdate');
        let deadlineDate = this.createTaskForm.get('deadline');

        //case 1: skills, date
        //subcase 1.1: skills, date and activity
        //subcase 1.2: skills, date but NO activity
        //case 2: skills, no date
        //subcase 2.1: skills, activity
        //subcase 2.2: skills only

         //case 1: skills, date
        if (startdateDate != null && deadlineDate != null && startdateDate?.value != "" && deadlineDate?.value != "")
        {
          
          let startdate = DateService.convertDateFormat(startdateDate.value);
          console.log(startdateDate.value)
          let deadline = DateService.convertDateFormat(deadlineDate.value);
          //subcase 1.1: skills, date and activity
          if (activity != null && activity.value != "")
          {
            console.log("Case 1.1")
            this.api.getEmployeesWithDateRangeForAct(activity.value.act_ID, startdate, deadline, mySkills)
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
    
              // getting reason
              console.log(startdate);
              res.forEach((e: any) => {
                this.api.explainEmployeeSuggestionForAct(activity?.value.act_ID, e.emp_ID, startdate, deadline, mySkills)
                .subscribe(data => {
                  e.emp_Reason = data;
                  e.emp_IsReason = true;
                })
              })
    
    
              for(let i = 0; i < 3; i++)
              {
                res.at(i)!.emp_IsReco = true;
              }
    
              this.recommended_employees = res;
              
              this.myEmployees = this.recommended_employees
            })
          }
          else
          {
            console.log("Case 1.2")
            //subcase 1.2: skills, date but NO activity
            this.api.getEmployeesWithDateRange(startdate, deadline, mySkills)
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
    
              // getting reason
              console.log(startdate);
              res.forEach((e: any) => {
                this.api.explainEmployeeSuggestion(e.emp_ID, startdate, deadline, mySkills)
                .subscribe(data => {
                  e.emp_Reason = data;
                  e.emp_IsReason = true;
                })
              })
    
              for(let i = 0; i < 3; i++)
              {
                res.at(i)!.emp_IsReco = true;
              }
    
              this.recommended_employees = res;
              
              this.myEmployees = this.recommended_employees
            })
          }
        }
        else
        {
          //case 2: skills, no date
          //subcase 2.1: skills, activity
          if (activity != null && activity.value != "")
          {
            console.log("Case 2.1")
            this.api.getEmployeesForAct(activity.value.act_ID,mySkills)
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
    
              // getting reason
              res.forEach((e: any) => {
                this.api.explainEmployeeSuggestionForAct(activity?.value.act_ID, e.emp_ID,"","", mySkills)
                .subscribe(data => {
                  console.log(data)
                  e.emp_Reason = data;
                  e.emp_IsReason = true;
                })
              })
    
    
              for(let i = 0; i < 3; i++)
              {
                res.at(i)!.emp_IsReco = true;
              }
    
              this.recommended_employees = res;
              
              this.myEmployees = this.recommended_employees
            })
          }
          else
          {
            //subcase 2.2: skills only
            console.log("Case 2.2")
            this.api.getEmployeeSuggestions(mySkills)
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
    
              // getting reason
              res.forEach((e: any) => {
                this.api.explainEmployeeSuggestion(e.emp_ID,"","", mySkills)
                .subscribe(data => {
                  e.emp_Reason = data;
                  e.emp_IsReason = true;
                })
              })
    
    
              for(let i = 0; i < 3; i++)
              {
                res.at(i)!.emp_IsReco = true;
              }
    
              this.recommended_employees = res;
              
              this.myEmployees = this.recommended_employees
            })
          } 
        }        
      }
      else
      {
        this.recommended_employees = [];
        this.myEmployees = this.employees
      }
    }
  }

  showRecommendation(e: Employee)
  {
    let cardsData: any = [];

    let arr = e.emp_Reason.split("\n")

    arr.forEach(item => {
      if(item.startsWith("P"))
      {
        cardsData.push({
          title: "Pro",
          content: item.replace("Pro: ", "")
        })
      }
      else if(item.startsWith("C"))
      {
        cardsData.push({
          title: "Con",
          content: item.replace("Con: ", "")
        })
      }
    })

    // Create custom HTML content for the alert
    let cardsHtml = cardsData
      .map((card: any) => {
        const cardClass = card.title == "Pro" ? "border-color: rgb(65, 250, 112); border-width: 2px;" : "border-color: rgb(221, 88, 62); border-width: 2px;";
        return `<div class="card" style="${cardClass}"><h5>${card.title}</h5><p>${card.content}</p></div>`;
      })
      .join("");

    // Show SweetAlert with custom content
    Swal.fire({
      html: cardsHtml,
      confirmButtonText: "OK",
      icon: "info"
    });
  }
  // ---

  goToConfimation()
  {
    if(this.createTaskForm.valid)
    {
      let obj = {
        "form": this.createTaskForm.value,
        "employees": this.selected_employees
      }

      this.share.setData(obj);

      let id = parseInt(this.activatedRoute.snapshot.paramMap.get('id')!)
      if(!Number.isNaN(id))
      {
        this.router.navigate(['../../task-confirmation'], { relativeTo: this.activatedRoute })
      }
      else
      {
        this.router.navigate(['../task-confirmation'], { relativeTo: this.activatedRoute })
      }
    }
  }

  compareDays(date1: Date|undefined, date2: Date | undefined)
  {
    if (date1 == undefined || date2 == undefined) return 0;
    let millis = (date1.getTime() - date2.getTime())
    return  Math.floor(millis / (1000 * 60 * 60 * 24))
  }
}
