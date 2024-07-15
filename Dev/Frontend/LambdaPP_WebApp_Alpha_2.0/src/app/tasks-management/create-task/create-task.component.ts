import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import ValidateForm from 'src/app/helpers/validateForm';
import Employee from 'src/app/models/Employee';
import Skill from 'src/app/models/Skill';
import Task from 'src/app/models/Task';
import { APIService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import * as lodash from 'lodash';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss'],
})
export class CreateTaskComponent implements OnInit {
  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  public dataSource!: MatTableDataSource<Employee>;
 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['select', 'Image', 'Name', 'IsAdmin', 'Recommended']
  selection = new SelectionModel<Employee>(true, []);

  // --- search
  applyFilter(event: Event)
  {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if(this.dataSource.paginator)
    {
      this.dataSource.paginator.firstPage();
    }
  }
  // ---

  // ---- role
  onFilter($event: any) {
    let filteredData = lodash.filter(this.employees, (item : Employee) => {
      return item.emp_Role == $event.value
    })

    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  reset() {
    this.dataSource = new MatTableDataSource(this.employees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // ----

  // --- mat
  selectionHandler(row: any) {
    this.selection.toggle(row)
    this.none_selected = false
    
    if(this.selection.isEmpty())
    {
      this.none_selected = true
    }
  }
  // ---

  todayDate = new Date();
  startDate!: Date;

  employees: Employee[] = [];
  skills: any;
  activities: any;

  // -- prime
  selected_employees: Employee[] = [];
  none_selected = false;

  createTaskForm!: FormGroup;

  ngOnInit(): void {
    this.createTaskForm = this.fb.group({
      activity: ['', Validators.required],
      taskname: ['', Validators.required],
      taskdesc: ['', Validators.required],
      startdate: ['', Validators.required],
      deadline: [''],
      skills: ['', Validators.required],
      // employees: ['', Validators.required],
    });

    this.getDataFromAPI();

    this.createTaskForm
      .get('startdate')
      ?.valueChanges.subscribe((selectedDate) => {
        this.startDate = selectedDate;
      });
    
    this.createTaskForm
      .get('skills')
      ?.valueChanges.subscribe((skill) => {
        this.recommendEmployees(skill)
      });
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

      this.employees = employees;

      this.dataSource = new MatTableDataSource(this.employees);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

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

  goBack() {
    this.router.navigate(['../task-management'], {
      relativeTo: this.activatedRoute,
    });
  }

  // for the deadline
  addValidator(field: string) {
    this.createTaskForm.get(field)?.setValidators(Validators.required);
    this.createTaskForm.get(field)?.updateValueAndValidity();
  }

  // -- employee recommendations
  recommended_employees: Employee[] = [];
  recommendEmployees(skill: Skill[]) {
    if(skill != undefined)
    {
      let skills = skill;
  
      let skillIDs: number[] = [];
      skills.forEach(s => {
        skillIDs.push(s.skill_ID!)
      })
      
      if(skillIDs.length != 0)
      {
        this.api.suggestBestEmployees(skillIDs)
        .subscribe(res => {
          this.recommended_employees = res;  
        })
      }
      else
      {
        this.recommended_employees = [];
      }
    }
  }
  // ---

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

  createTask(formDirective: FormGroupDirective) {
    if (this.createTaskForm.valid && !this.selection.isEmpty()) {
      let formActivity = this.createTaskForm.get('activity')?.value;
      let name = this.createTaskForm.get('taskname')?.value;
      let desc = this.createTaskForm.get('taskdesc')?.value;
      let startdate = this.createTaskForm.get('startdate')?.value;
      let deadline = this.createTaskForm.get('deadline')?.value;
      let selected_skills = this.createTaskForm.get('skills')?.value;
      // let selected_employees = this.createTaskForm.get('employees')?.value;

      // --- prime
      // let selected_employees = this.selected_employees;
      
      let selected_employees = this.selection.selected;
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
        this.api.assignEmployees(task.task_ID, empIDs)
        .subscribe(emps => {})
          this.api.assignSkills(task.task_ID, skillIDs)
          .subscribe(sks => {})

          Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          }).fire({
            icon: 'success',
            title: 'Task Created Successfully',
          });
      });

      // resets the form
      formDirective.resetForm();
      this.createTaskForm.reset();
      
      // prime 
      // this.selected_employees = [];
      // console.log(this.selected_employees)

      // resets the table - mat
      this.selection.clear()
      this.recommended_employees = []
    }
    // else if(this.selected_employees.length == 0)
    // {
    //   this.none_selected = true;
    // }
    else if(this.selection.isEmpty())
    {
      this.none_selected = true;
    } 
    else 
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.createTaskForm);
    }
  }
}
