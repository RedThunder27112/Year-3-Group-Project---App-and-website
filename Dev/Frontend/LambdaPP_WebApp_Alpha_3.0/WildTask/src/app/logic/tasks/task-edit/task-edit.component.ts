import { Component } from '@angular/core';
import { APIService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';

import Employee from '../../models/Employee';
import Task from '../../models/Task';
import Skill from '../../models/Skill';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-edits',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  providers: [MessageService]
})
export class TaskEditComponent {

  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  todayDate = new Date();
  startDate!: Date;
  task!: any;

  employees: Employee[] = [];
  all_employees: Employee[] = [];
  chosen_employees: Employee[] = [];
  skills: any;
  activities: any[] = [];

  isTemplate = false;

  supervisor!: Employee;

  // data binding
  myActivity!: any;
  myTaskName!: any;
  myTaskDesc!: any;
  myStartDate!: any;
  myEndDate!: any;
  mySkills!: any;

  breadcrumbItems: MenuItem[] = [];
  
  taskID!: number;
  editTaskForm !: FormGroup;
  // -- prime
  selected_employees: Employee[] = [];
  none_selected = false;
  
  roles = ["Employee", "Administrator", "Contractor"]

  ngOnInit(): void {

    this.editTaskForm = this.fb.group({
      activity: ['', Validators.required],
      taskname: ['', Validators.required],
      taskdesc: ['', Validators.required],
      startdate: ['', Validators.required],
      deadline: ['', Validators.required],
      skills: ['', Validators.required],
    })

    this.getDataFromAPI();

    // getting task details to display
    this.activatedRoute.params
    .subscribe(val=> {
        let taskID : number = val['id']
        this.taskID = val['id'];

        let template = val['template']
        console.log(template)

        this.breadcrumbItems = [];
        if (template!= undefined)
        {
          this.isTemplate = true;
          this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../../../' });
          this.breadcrumbItems.push({ label: 'Task Setup', routerLink: ['../../../task-setup'] });
          this.breadcrumbItems.push({ label: 'Task Templates', routerLink: ['../../../task-templates'] });
          this.breadcrumbItems.push({ label: 'Edit', routerLink: ['../../../task-templates/edit'] });            
          this.breadcrumbItems.push({ label: 'Edit Template', routerLink: ['../../task-edit', this.taskID, "template"] });

          this.api.getTaskTemplateToTask(taskID)
          .subscribe(task => {
            this.task = task;
            // console.log(task)

            this.activities.forEach(act => {
              if(act.act_ID == this.task.act_ID) this.myActivity = act;
            })

            // this.myActivity = this.task.activity;
            this.myTaskName = this.task.task_Name
            this.myTaskDesc = this.task.task_Description
            this.myStartDate = new Date(this.task.task_Date_Started)
            this.myEndDate = new Date(this.task.task_Deadline)

            this.api.getTaskTemplateSkills(taskID)
            .subscribe(sk => {
              let skillsNoLevels: any[] = []
              sk.forEach(skill => {
                skillsNoLevels.push(skill.skill)
              })

              this.mySkills = skillsNoLevels
            })
          })

        }
        else
        {
          this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../../' });
          this.breadcrumbItems.push({ label: 'Task Details', routerLink: ['../../task-detail', this.taskID] });
          this.breadcrumbItems.push({ label: 'Edit Task', routerLink: ['../../task-edit', this.taskID] });
          this.api.getTask(taskID)
          .subscribe(task => {
            this.task = task;
            // console.log(task)

            this.activities.forEach(act => {
              if(act.act_ID == this.task.act_ID) this.myActivity = act;
            })

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

              // adding an image
              emps.forEach(e => {
                this.api.getProfilePic(e.emp_ID!)
                .subscribe(url => {
                  e.emp_ID_Image = url;
                })
              })

              this.chosen_employees = emps;
              this.employees = this.chosen_employees;
            })

            this.api.getSkillsByTask(taskID)
            .subscribe(sk => {
              let skillsNoLevels: any[] = []
              sk.forEach(skill => {
                skillsNoLevels.push(skill.skill)
              })

              this.mySkills = skillsNoLevels
            })
          })
        }
          

        
        
      }
    )

    this.api.getTaskSupervisor(this.taskID)
    .subscribe(res => {
      this.supervisor = res;
    }) 
  }

  getDataFromAPI() {
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

      this.all_employees = employees;

      // gets non-admin employees
      // res.forEach(e => {
      //   if(!e.emp_IsAdmin) this.employees.push(e);
      // })
    });

    this.api.getSkills().subscribe((res) => {
      this.skills = res;
    });

    this.api.getActivities().subscribe((res) => {
      this.activities = res;
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

  createTask()
  {
    console.log("updating...")

    this.editTaskForm.get('activity')?.setValue(this.myActivity);
    this.editTaskForm.get('taskname')?.setValue(this.myTaskName);
    this.editTaskForm.get('taskdesc')?.setValue(this.myTaskDesc);
    this.editTaskForm.get('startdate')?.setValue(this.myStartDate);
    this.editTaskForm.get('deadline')?.setValue(this.myEndDate);
    this.editTaskForm.get('skills')?.setValue(this.mySkills);

    console.log(this.editTaskForm)
    if(this.editTaskForm.valid)
    {
      let formActivity = this.editTaskForm.get('activity')?.value;
      let name = this.editTaskForm.get('taskname')?.value;
      let desc = this.editTaskForm.get('taskdesc')?.value;
      let startdate = this.editTaskForm.get('startdate')?.value;
      let deadline = this.editTaskForm.get('deadline')?.value;
      let selected_skills = this.editTaskForm.get('skills')?.value;

      let selected_employees = this.selected_employees;
      let task = new Task(formActivity.act_ID, name, desc, startdate, deadline);
      console.log("task being updated:", task);
      // get employee IDs
      let empIDs: number[] = [];
      selected_employees.forEach((e: Employee) => {
        empIDs.push(e.emp_ID!);
      });

      // get skill IDs
      let skillIDs: number[] = [];
      selected_skills.forEach((s: Skill) => {
        skillIDs.push(s.skill_ID!);
      });
      console.log("selectedEmployees, skills put into arrays");
      task.task_ID = this.taskID;
      this.api.updateTask(task).subscribe((ret) => {
        console.log("task updated!", ret);
        this.api.assignEmployees(task.task_ID!, empIDs).subscribe( (ret2) => {
          this.api.assignSkills(task.task_ID!, skillIDs).subscribe((ret3) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Created Successfully"});
            setTimeout((res: any) => {
              this.router.navigate(['../../task-overview'], { relativeTo: this.activatedRoute })
            }, 3000)
          })

        })
      });
    }
    else
    {
      this.messageService.add({ severity: 'error', summary: 'Failure', detail: "Details not valid!"});
    }
  }
  updateTemplate()
  {
    console.log("updating...")

    this.editTaskForm.get('activity')?.setValue(this.myActivity);
    this.editTaskForm.get('taskname')?.setValue(this.myTaskName);
    this.editTaskForm.get('taskdesc')?.setValue(this.myTaskDesc);
    this.editTaskForm.get('startdate')?.setValue(this.myStartDate);
    this.editTaskForm.get('deadline')?.setValue(this.myEndDate);
    this.editTaskForm.get('skills')?.setValue(this.mySkills);

    console.log(this.editTaskForm)
    if(this.editTaskForm.valid)
    {
      let formActivity = this.editTaskForm.get('activity')?.value;
      let name = this.editTaskForm.get('taskname')?.value;
      let desc = this.editTaskForm.get('taskdesc')?.value;
      let startdate = this.editTaskForm.get('startdate')?.value;
      let deadline = this.editTaskForm.get('deadline')?.value;
      let selected_skills = this.editTaskForm.get('skills')?.value;

      
      let task = new Task(formActivity.act_ID, name, desc, startdate, deadline);
      console.log("task being updated:", task);
      // get employee IDs
    
      // get skill IDs
      let skillIDs: number[] = [];
      selected_skills.forEach((s: Skill) => {
        skillIDs.push(s.skill_ID!);
      });
      console.log("selectedEmployees, skills put into arrays");
      task.task_ID = this.taskID; //note that this is actually the template id, that's how this works
      this.api.updateTaskTemplate(task).subscribe((ret) => {
        console.log("template updated!", ret);
        this.api.assignTaskTemplateSkills(task.task_ID!, skillIDs).subscribe((ret2) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Template Updated Successfully"});
            setTimeout((res: any) => {
              this.router.navigate(['../../../task-templates'], { relativeTo: this.activatedRoute })
            }, 3000)
        })

       
      });
    }
    else
    {
      this.messageService.add({ severity: 'error', summary: 'Failure', detail: "Details not valid!"});
    }
  }

  deleteTask()
  {
    var taskOrTemplate = 'task'
    if (this.isTemplate) taskOrTemplate = 'template'
    Swal.fire({
      icon: 'warning',
      title: `Do you want to delete this ${taskOrTemplate}?`,
      text: `The ${taskOrTemplate} will be permanently deleted!`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Don't Delete",
      denyButtonText: `Delete ${taskOrTemplate}`,
    }).then((result) => {
      if (result.isConfirmed) {
        // do nothing
      }
      else if (result.isDenied) {
        //delete the template or task
        if (!this.isTemplate)
        {
          this.api.deleteTask(this.taskID).subscribe((ret2) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Deleted"});
              setTimeout((res: any) => {
                this.router.navigate(['../../task-overview'], { relativeTo: this.activatedRoute })
              }, 3000)
          })
        }
        else
        {
          this.api.deleteTaskTemplate(this.taskID).subscribe((ret2) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Template Deleted"});
              setTimeout((res: any) => {
                this.router.navigate(['../../../task-templates'], { relativeTo: this.activatedRoute })
              }, 3000)
          })
        }
      }
    })
  }

  goBack()
  {
    if (this.isTemplate)
      this.router.navigate(['../../../task-templates/edit'], { relativeTo: this.activatedRoute })
    else
      this.router.navigate(['../../task-detail', this.taskID], { relativeTo: this.activatedRoute })
  }
}
