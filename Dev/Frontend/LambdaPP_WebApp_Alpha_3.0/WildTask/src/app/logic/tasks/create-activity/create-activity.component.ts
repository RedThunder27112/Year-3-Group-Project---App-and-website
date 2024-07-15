import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { APIService } from '../../api.service';
import Activity from '../../models/Activity';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.scss'],
  providers: [MessageService]
})
export class CreateActivityComponent {

  createActForm!: FormGroup
  breadcrumbItems: MenuItem[] = [];
  isEdit: boolean = false;
  activities: any[] = [];

  constructor(private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder,
              private api: APIService,
              private messageService: MessageService) {}

  ngOnInit(): void {
    this.createActForm = this.fb.group({
      name: ['', Validators.required],
      desc: ['', Validators.required],
      minEmps: [''],
      maxEmps: [''],
      maxTasks: [''],
      activity: [''],
    });

    this.createActForm
    .get('minEmps')
    ?.valueChanges.subscribe((minEmployees) => {
      let max = this.createActForm.get("maxEmps")
      if (max != null) 
        if (max.value < minEmployees)
        {
          max.setValue(minEmployees);
          max.addValidators(Validators.min(minEmployees))
        }
          
    });

    this.breadcrumbItems = [];

    this.activatedRoute.params
    .subscribe(val=> {
      let Edit = val['edit'];

      if (Edit!=undefined)
      {
        this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../../' });;
        this.breadcrumbItems.push({ label: 'Add New Activity', routerLink: ['../../create-activity'] });
        this.breadcrumbItems.push({ label: 'Edit', routerLink: ['../edit'] });
        this.isEdit = true;
        this.api.getActivities().subscribe((res) => {
          this.activities = res;
        });
      }
      else
      {
        this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../' });
        this.breadcrumbItems.push({ label: 'Add New Activity', routerLink: ['../create-activity'] });
      }


    })



    
   


    

    /*this.createActForm
    .get('maxEmps')
    ?.valueChanges.subscribe((maxEmployees) => {
      let min = this.createActForm.get("minEmps")
      if (min != null) 
        if (maxEmployees < min.value)
          maxEmployees = min;
    });*/
  }

  createActivity() {
    if(this.createActForm.valid)
    {
      let name = this.createActForm.get("name")?.value
      let desc = this.createActForm.get("desc")?.value
      let minEmps = this.createActForm.get("minEmps")?.value
      let maxEmps = this.createActForm.get("maxEmps")?.value
      let maxTasks = this.createActForm.get("maxTasks")?.value

      let activity = new Activity(name, desc)
      if (minEmps != undefined && minEmps != 0)
        activity.act_Recommended_Min_Emps_Per_Task = minEmps;
      if (maxEmps != undefined && maxEmps != 0)
        activity.act_Recommended_Max_Emps_Per_Task = maxEmps;
      if (maxTasks != undefined  && maxTasks != 0)
        activity.act_Recommended_Max_Tasks_Per_Emp = maxTasks;


      if (!this.isEdit)
      {
        this.api.createActivity(activity)
        .subscribe(res => {

          Swal.fire({
            icon: 'success',
            title: 'Activity Created Successfully',
            text: 'Would you like to create a new task?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Yes',
            denyButtonText: `No`,
          }).then((result) => {
            
            if (result.isConfirmed) {
              this.router.navigate(["main/tasks/create-task"])
              // Swal.fire('Saved!', '', 'success')
            } else if (result.isDenied) {
              // Swal.fire('Changes are not saved', '', 'info')
            }
          })

          // this.messageService.add({ severity: 'success', summary: 'Success', detail: "Activity Created Successfully"});
          this.createActForm.reset()
        })
      }
      else
      {
        let act : Activity = this.createActForm.get("activity")?.value
        let actID = act.act_ID
        activity.act_ID = actID;
        this.api.updateActivity(activity)
        .subscribe(res => {

          Swal.fire({
            icon: 'success',
            title: 'Activity Updated Successfully',
            text: 'Would you like to create a new task?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Yes',
            denyButtonText: `No`,
          }).then((result) => {
            
            if (result.isConfirmed) {
              this.router.navigate(["main/tasks/create-task"])
              // Swal.fire('Saved!', '', 'success')
            } else if (result.isDenied) {
              // Swal.fire('Changes are not saved', '', 'info')
            }
          })

          // this.messageService.add({ severity: 'success', summary: 'Success', detail: "Activity Created Successfully"});
          this.createActForm.reset()
        })
      }
        
    }
  }

  goBack() {
    this.router.navigate(['../task-management'], {relativeTo: this.activatedRoute})
  }

  setAct()
  {
    let act : Activity = this.createActForm.get("activity")?.value
    console.log(act)
    if (act!=undefined)
    {
      this.createActForm.setValue({
        ["name"]:  act.act_Name,
        ["desc"]: act.act_Description,
        ["minEmps"]: act.act_Recommended_Min_Emps_Per_Task,
        ["maxEmps"]: act.act_Recommended_Max_Emps_Per_Task,
        ["maxTasks"]: act.act_Recommended_Max_Tasks_Per_Emp
      
      })
    }
  }
}
