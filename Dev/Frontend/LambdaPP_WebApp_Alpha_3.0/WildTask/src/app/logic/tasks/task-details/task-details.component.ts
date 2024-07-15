import { Component } from '@angular/core';
import { APIService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';

import Employee from '../../models/Employee';
import Task from '../../models/Task';
import Skill from '../../models/Skill';
import Stock from '../../models/Stock';
import Equipment from '../../models/Equipment';
import { SkillsRoutingModule } from '../../skills/skills-routing.module';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  providers: [MessageService]
})
export class TaskDetailsComponent {

  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  todayDate = new Date();
  startDate!: Date;
  task: any = undefined;
  latestUpdateDay: Date|undefined;

  employees: Employee[] = [];
  employeeCount: number[] = [];
  selectedEmployeeRatingsGiven: any[] = [];

  all_employees: Employee[] = [];
  chosen_employees: Employee[] = [];
  skills: any;

  supervisor: Employee|undefined;

  // data binding
  myActivity: any;
  myTaskName: any;
  myTaskDesc: any;
  myStartDate: any;
  myEndDate: Date|undefined;
  mySkills: any[] = [];
  updateCount: number = 0;
  stock: Stock[] = [];
  equipment: Equipment[] = [];

  taskID!: number;
  editTaskForm !: FormGroup;
  // -- prime
  selected_employees: Employee[] = [];
  none_selected = false;

  breadcrumbItems: MenuItem[] = [];

  ngOnInit(): void {

    this.getDataFromAPI();

    // getting task details to display
    this.activatedRoute.params
    .subscribe(val=> {
        let taskID : number = val['id']
        this.taskID = val['id'];

        this.breadcrumbItems = [];
        this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../../' });
        this.breadcrumbItems.push({ label: 'Task Details', routerLink: ['../../task-detail', this.taskID] });

        this.api.getTask(taskID)
        .subscribe(task => {
          this.task = task;
          // console.log(task)

          this.api.getActivity(this.task.act_ID).subscribe(res => {this.myActivity = res})

          // this.myActivity = this.task.activity;
          this.myTaskName = this.task.task_Name
          this.myTaskDesc = this.task.task_Description
          this.myStartDate = new Date(this.task.task_Date_Started)
          this.myEndDate = new Date(this.task.task_Deadline)

          this.api.getEmployeesByTask(taskID)
          .subscribe(emps => {
            
            // adding a role
            emps.forEach(e => {
              if(e.emp_IsAdmin) { e.emp_Role = "Administrator" }
              else if(e.emp_IsContractor) { e.emp_Role = "Contractor" }
              else { e.emp_Role = "Employee" }
            })
            

            for(let i: number = 0; i < emps.length; i++)
            {
              this.employeeCount.push(i);
              let e = emps[i];
              this.api.getProfilePic(e.emp_ID!)
              .subscribe(url => {
                e.emp_ID_Image = url;
              })
              this.api.getEmployeeRatingsForTask(e.emp_ID!, taskID)
              .subscribe(res => {
                e.ratingsGiven = res;
                let total: number = 0;
                e.ratingsGiven.forEach((rating) => {
                  total += rating.rating_Rating;
                  let reviewer = emps.find(v => v.emp_ID == rating.reviewer_ID);
                  if (reviewer != undefined)
                    rating.reviewer = reviewer;
                });
                e.emp_Rating = Math.round(total/e.ratingsGiven.length);
                this.selectedEmployeeRatingsGiven = e.ratingsGiven;
              })

              this.api.getEmployeeSkills(e.emp_ID!)
              .subscribe(skillsbridges => {
                e.employee_Skill_Bridges = skillsbridges;
                if (i == emps.length-1)
                {
                  //last employee's skills have been gotten, we can do stuff with it now

                  this.chosen_employees = emps;
                  this.employees = this.chosen_employees;
                  this.api.getSkillsByTask(taskID)
                    .subscribe(sk => {
                      let skillsNoLevels: any[] = []
                      sk.forEach(skill => {
                        let skillToEnter : Skill = skill.skill
                        //get the employees skills
                        this.chosen_employees.forEach(emp => {
                         
                          if (emp != undefined && emp != null)
                          {
                            console.log(emp.emp_Name,emp.employee_Skill_Bridges)
                            //one employee should only have 1 bridge with a skill
                            let bridge = emp.employee_Skill_Bridges?.find(bridge => bridge.skill?.skill_ID === skillToEnter.skill_ID)
                            console.log("bridge",bridge)
                            if (bridge != undefined)
                            {
                              bridge.employee = emp
                              if (skillToEnter.Employee_Skill_Bridges == undefined)
                                skillToEnter.Employee_Skill_Bridges = []
                              skillToEnter.Employee_Skill_Bridges?.push(bridge)
                            }
                            console.log("Skills",skillToEnter);
                          }
                        
                        })
                        skillsNoLevels.push(skillToEnter)
                      })
      
                      this.mySkills = skillsNoLevels
                    })
                }
              })
            }
          })
        })

        this.api.getTaskUpdates(this.taskID)
        .subscribe(taskUpdates => {
          this.updateCount = taskUpdates.length;
          taskUpdates.sort( update => update.update_Time);
          this.latestUpdateDay = new Date (taskUpdates[0].update_Time);
        })

        this.api.getTaskSupervisor(this.taskID)
        .subscribe(res => {
          this.supervisor = res;
          console.log("supervisor of task" + this.taskID, this.supervisor)
        }) 

        this.api.getTaskStock(this.taskID)
        .subscribe(res => {
          // adding images to stock
          res.forEach((e: Stock) => {
            this.api.getStockImage(e.stock_ID)
              .subscribe(url => {
                e.stock_Image = url;
              })
          });
          this.stock = res;
        }) 

        this.api.getTaskEquipment(this.taskID)
        .subscribe(res => {
          console.log(res)
          // adding images to stock
          res.forEach((e: Equipment) => {
            this.api.getEquipImage(e.eqp_ID)
              .subscribe(url => {
                e.eqp_Image = url;
              })
          });
          this.equipment = res;
        }) 

      }
    )
  }

  getDataFromAPI() {
    this.api.getSkills().subscribe((res) => {
      this.skills = res;
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

  getSeverity(status: string) 
  {
    if(status == "IN PROGRESS") return 'info';
    else if(status == "COMPLETED") return 'success';
    else if(status == "RESOURCES ALLOCATED") return '';
    else if(status == "AWAITING REVIEW") return 'warning';
    else return ""
  } 
  // rating categories
  getRatingCategory(ratingCat: number)
  {
    if(ratingCat == 1) return "POSITIVE"
    else if (ratingCat == 2) return "NEUTRAL"
    else if (ratingCat == 3) return "NEGATIVE"
    else return "UNDEFINED"
  }

  getRatingSeverity(ratingCat: number) 
  {
    if(ratingCat == 1) return "success"
    else if (ratingCat == 2) return "info"
    else if (ratingCat == 3) return "danger"
    else return ""
  }

  compareDays(date1: Date|undefined, date2: Date | undefined)
  {
    if (date1 == undefined || date2 == undefined) return 0;
    let millis = (date1.getTime() - date2.getTime())
    return  Math.floor(millis / (1000 * 60 * 60 * 24))
  }

  betterDate(dateStr: string) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleString('en-US', options);
  }

  updateSelectedReviews(n: number)
  {
    let ratings =  this.employees[n].ratingsGiven;
    if (ratings != undefined)
      this.selectedEmployeeRatingsGiven = ratings;
  }
}
