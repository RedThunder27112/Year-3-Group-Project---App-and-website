import { Component } from '@angular/core';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from 'src/app/helpers/validateForm';
import { TaskService } from 'src/app/services/task.service';

import { HttpClient, HttpResponse } from '@angular/common/http';
import Task from 'src/app/models/Task';
import Skill from 'src/app/models/Skill';
import Employee from 'src/app/models/Employee';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent {

  //Create task:
  //list of different activities it could be associate with
  //name
  //start date
  //deadline
  //description
  //status - no need for this, just default to in progress
  //employees
  //stock
  //equipment
  //no need for updates, they'll be added later


   // Form Validation
   /*taskCreationForm!: FormGroup;
   constructor(private fb: FormBuilder, private taskService: TaskService, private http: HttpClient) { }
   
   ngOnInit(): void {
     this.taskCreationForm = this.fb.group({
 
       Name: ['', Validators.required],
       StartDate: ['', Validators.required],
       Deadline: ['', Validators.required],
       Description: ['', Validators.required],
       Employees: ['', Validators.required],
       Stock: ['', Validators.required],
       Equipment: ['', Validators.required],
       Activity: ['',Validators.required]
     })
   }
 
   onSubmit() {
     if(this.taskCreationForm.valid) 
     {
       this.taskService.createTask(this.taskCreationForm)
       .subscribe((res) =>
       {
         // checks the value of the GET request
         if(parseInt(res) >= 0)
         {
           alert("TaskCreated!")
           this.taskCreationForm.reset()
         }
         else
         {
           alert("Task Creation Unsuccessful!")
         }
       })
     }
     else
     {
       // throw an error
       ValidateForm.valiateAllFormFields(this.taskCreationForm)
     }
   }

   //needed: Load possible activities

   //suggest best employee for the task*/

   task: Task = new Task();
   skills: Skill[] = [];
   employees: EmployeeWithChecked[] = [];
   empsToAssign: Number[] = [];
   

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    this.taskService.getSkills()
      .subscribe(
        (skills) => {
          this.skills = skills;
        },
        (error) => {
          console.error('Error fetching skills:', error);
        }
      );
      this.taskService.getEmployees()
      .subscribe(
        (employees) => {
          employees.forEach(element => {
            this.employees.push(new EmployeeWithChecked(element))
          })
        },
        (error) => {
          console.error('Error fetching employees:', error);
        }
      );
  }

  onSubmit() {
    this.taskService.createTask(this.task)
      .subscribe(
        (response) => {
          // Handle success
          console.log('Task created successfully:' + response.task_ID);
          alert("Task created successfully: " + response.task_ID);

          //assign skills to the task

          //assign employees to the task
         
          this.employees.forEach(element => {
            if (element.checked)
              if (element.emp.emp_ID != null)
                this.empsToAssign.push(element.emp.emp_ID)
          });
          this.taskService.assignEmployees(response.task_ID, this.empsToAssign)
          .subscribe(
            (response) => {
              //handle success
              console.log('Employee assigned successfully!');
            },
            (error) => {
              //handle error
              console.error('Error assigning employee:', error);
            }
          )

          // Reset the form
          this.task = new Task();
        },
        (error) => {
          // Handle error
          console.error('Error creating task:', error);
        }
      );
  }

}

class EmployeeWithChecked
{
  emp: Employee;
  checked: Boolean;

  constructor(employee: Employee)
  {
    this.emp = employee
    this.checked = false
  }
}
