import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { APIService } from '../../../api.service';
import { TaskCreationService } from '../task-creation.service';
import Employee from '../../../models/Employee';
import Skill from '../../../models/Skill';
import Task from '../../../models/Task';
import TaskUpdate from '../../../models/TaskUpdate';
import { DateService } from '../../../../helpers/GetDates';

@Component({
  selector: 'app-task-confirmation',
  templateUrl: './task-confirmation.component.html',
  styleUrls: ['./task-confirmation.component.scss'],
  providers: [MessageService]
})
export class TaskConfirmationComponent implements OnInit {

  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private share: TaskCreationService
  ) {}

  formData !: any
  createTaskForm!: FormGroup
  selected_employees!: any;
  selected_skills: any[] | undefined;

  issues: String[] = [];

  ngOnInit()
  {
    this.share.currentData.subscribe((data : any) => {
      this.formData = data;
      console.log("passed form",this.formData)

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

      let location = (data.form.location == undefined) ? "" : data.form.location;     
      console.log("location",location) 
      this.createTaskForm.setValue({
        "activity": data.form.activity,
        "taskname": data.form.taskname,
        "taskdesc": data.form.taskdesc,
        "startdate": data.form.startdate,
        "deadline": data.form.deadline,
        "skills": data.form.skills,
        "tasksupervisor": this.formData.form.tasksupervisor,
        "location": location
      })

      console.log("create task form",this.createTaskForm)
      if (this.createTaskForm.get('tasksupervisor') == undefined || this.createTaskForm.get('tasksupervisor')?.value == "") 
        {console.log("no supervisor")}

      this.selected_employees = data.employees;
      this.selected_skills = data.form.skills;

      
      let newSkills : Skill[] = []
      data.form.skills.forEach((skill: Skill) => {
        skill.Employee_Skill_Bridges = undefined;
        //get the employees skills
        this.selected_employees.forEach((emp : Employee) => {
          
          if (emp != undefined && emp != null)
          {
            console.log(emp.emp_Name,emp.employee_Skill_Bridges)
            //one employee should only have 1 bridge with a skill
            let bridge = emp.employee_Skill_Bridges?.find(bridge => bridge.skill_ID === skill.skill_ID)
            if (bridge != undefined)
            {
              bridge.employee = emp
              if (skill.Employee_Skill_Bridges == undefined)
                skill.Employee_Skill_Bridges = []
              skill.Employee_Skill_Bridges?.push(bridge)
              console.log("Skill being added",skill);
            }
            
          }
        
        })
        newSkills.push(skill)
      })
      this.selected_skills = newSkills;


      this.api.getTeamCompatability(this.selected_employees).subscribe((issues) => {
        if (issues.length > 0)
          this.issues = issues;
      })

      let me = JSON.parse(sessionStorage.getItem("emp")!);
      console.log(me.emp_ID)

    });
  }

  createTask()
  {
    if(this.createTaskForm.valid)
    {
      let formActivity = this.createTaskForm.get('activity')?.value;
      let name = this.createTaskForm.get('taskname')?.value;
      let desc = this.createTaskForm.get('taskdesc')?.value;
      let startdate = this.createTaskForm.get('startdate')?.value;
      let deadline = this.createTaskForm.get('deadline')?.value;
      let selected_skills = this.createTaskForm.get('skills')?.value;
      let supervisor = this.createTaskForm.get('tasksupervisor')?.value;
      let location = this.createTaskForm.get('location')?.value;

      let selected_employees = this.selected_employees;
      let task = new Task(formActivity.act_ID, name, desc, startdate, deadline);

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

      this.api.createTask(task).subscribe((task) => {
        if (supervisor != undefined && supervisor != "")
        {
          this.api.assignEmployeesWithSupervisor(task.task_ID, supervisor.emp_ID, empIDs).subscribe(() => {
            console.log("Employees with supervisor assigned")
            this.assignSkills(task,skillIDs,location)
          })
        }
        else
        {
          this.api.assignEmployees(task.task_ID, empIDs).subscribe(() => {
            console.log("Employees")
            this.assignSkills(task,skillIDs,location)
          })
        }
        
      });
    }
  }

  assignSkills(task: any, skillIDs: number[],location: any)
  {
    this.api.assignSkills(task.task_ID, skillIDs).subscribe(() => {
      console.log("Skills")
      if (location != undefined && location != "") 
      {
        //create an update for the task that sets the location
        let update = new TaskUpdate()
        let me = JSON.parse(sessionStorage.getItem("emp")!);
        update.emp_ID = me.emp_ID;
        update.task_ID = task.task_ID
        update.update_Time =  DateService.getUTCDate(new Date());
        update.update_Description = "Initial location posted";
        update.update_Location = location.loc_Coordinates;
        
        this.api.postTaskUpdate(update).subscribe(() => {
          this.displaySuccess();
        })
      }
      else
       this.displaySuccess();
    })
  }

  displaySuccess()
  {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Created Successfully"});
    setTimeout((res: any) => {
      this.router.navigate(['../../task-overview'], { relativeTo: this.activatedRoute })
    }, 3000)
  }

  createTemplate()
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Template Saved!"});
          })        
        });
      }
      else
      {
        this.api.createTaskTemplate(task).subscribe((tasktemp) => {
          this.api.assignTaskTemplateSkills(tasktemp.template_ID, skillIDs).subscribe(res => {
            console.log("Skills")
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Task Template Saved!"});
          })        
        });
      }

      
    }
  }
}
