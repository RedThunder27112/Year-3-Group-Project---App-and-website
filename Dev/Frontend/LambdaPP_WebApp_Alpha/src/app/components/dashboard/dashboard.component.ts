import { Component } from '@angular/core';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from 'src/app/helpers/validateForm';
import { TaskService } from 'src/app/services/task.service';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

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
 
   onTaskCreation() {
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
   }*/

   //needed: Load possible activities

   //suggest best employee for the task

}
