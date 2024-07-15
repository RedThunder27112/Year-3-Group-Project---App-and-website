import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import Activity from 'src/app/models/Activity';
import Employee from 'src/app/models/Employee';
import Skill from 'src/app/models/Skill';
import Task from 'src/app/models/Task';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent {

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder) {}

  public dataSource!: MatTableDataSource<Employee>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['Image', 'Name', 'Surname', 'Username', 'IsAdmin', 'dateReg', 'Action']
  
  taskID!: number;
  task!: any;
  employees!: Employee[]
  skills: any;
  activities: any;
  editTaskForm!: FormGroup;

  selected_employees!: Employee[]

  canEdit = false;

  ngOnInit(): void {

    this.editTaskForm = this.fb.group({
      // will add validation later
      activity: [''],
      taskname: [''],
      taskdesc:[''],
      startdate: [''],
      deadline: [''],
      skills: [''],
      employees: ['']
    });

    this.getDataFromAPI();

    this.activatedRoute.params.subscribe(
      val=> {
        this.taskID = val['taskID']
        this.api.getTask(this.taskID)
        .subscribe(res => {
          this.task = res;
          this.fillForm(this.task);
        })
      }
    )
  }

  getDataFromAPI() {
    this.api.getAllEmployees()
    .subscribe(emps => {

      this.employees = emps;

      // res.forEach(e => {
      //   if(!e.emp_IsAdmin) this.employees.push(e as Employee);
      // })
    })

    this.api.getSkills()
    .subscribe(skills => {
      this.skills = skills;
    })

    this.api.getActivities()
    .subscribe(acts => {
      this.activities = acts;
    })
  }

  goBack() {
    this.router.navigate(['../../task-management'], {relativeTo: this.activatedRoute})
  }

  editTask() {

  }
  
  compare(sk1: any, sk2: any)
  {
    return sk1 && sk2 && sk1.skill_ID == sk2.skill_ID
  }

  compareActivities(act1: Activity, act2: Activity)
  {
    return act1 && act2 && act1.act_ID == act2.act_ID
  }
  
  compareEmployees(emp1: Employee, emp2: Employee)
  {
    return emp1 && emp2 && emp1.emp_ID == emp2.emp_ID
  }

  fillForm(task: Task) {
    this.api.getEmployeesByTask(task.task_ID!).subscribe(emps => {

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

      this.selected_employees = emps;

      this.api.getSkillsByTask(task.task_ID!).subscribe(sk => {
        
        let skillsNoLevels: any[] = []
        sk.forEach(skill => {
          skillsNoLevels.push(skill.skill)
        })

        this.editTaskForm.setValue({
          activity: task.activity,
          taskname: task.task_Name,
          taskdesc: task.task_Description,
          startdate: task.task_Date_Started,
          deadline: task.task_Deadline,
          skills: skillsNoLevels,
          employees: emps
        })
      })
    })
  }
}
