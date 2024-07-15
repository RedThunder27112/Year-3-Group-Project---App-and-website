import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { APIService } from '../../api.service';
import TaskUpdate from '../../models/TaskUpdate';
import Swal from 'sweetalert2';
import Task from '../../models/Task';
import { MiniEmployeeTableComponent } from './mini-employee-table/mini-employee-table.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-task-updates',
  templateUrl: './task-updates.component.html',
  styleUrls: ['./task-updates.component.scss'],
  providers: [DialogService]
})
export class TaskUpdatesComponent {

  taskID!: number
  myTask!: any;
  taskUpdates!: TaskUpdate[]
  employees!: any[]

  breadcrumbItems: MenuItem[] = [];
  googleMapsAPIKey = "AIzaSyCyvyXekvBbyO2CFpjApWDlo_qANjm0QdE"

  ref: DynamicDialogRef | undefined;

  constructor(private api: APIService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder,
              private dialogService: DialogService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      val => {
        this.taskID = val['id'];
        
        // breadcrumbs
        this.breadcrumbItems = [];
        this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../../' });
        this.breadcrumbItems.push({ label: 'Details', routerLink: ['../../task-detail', this.taskID] });
        this.breadcrumbItems.push({ label: 'Updates' });

        this.api.getTask(this.taskID)
          .subscribe((res) => {
            this.myTask = res;

            this.api.getEmployeesByTask(this.taskID)
              .subscribe(emps => {

                // adding a role
                emps.forEach(e => {
                  if (e.emp_IsAdmin) { e.emp_Role = "Administrator" }
                  else if (e.emp_IsContractor) { e.emp_Role = "Contractor" }
                  else { e.emp_Role = "Employee" }

                  this.api.getProfilePic(e.emp_ID!)
                    .subscribe(url => {
                      e.emp_ID_Image = url;
                    })
                })

                this.employees = emps;
              })
          })

        this.api.getTaskUpdates(this.taskID)
          .subscribe(taskUpdates => {

            taskUpdates.forEach(t => {
              // employee image
              this.api.getProfilePic(t.employee.emp_ID)
                .subscribe(url => {
                  t.employee.emp_ID_Image = url;
                })

              // task update image
              this.api.hasUpdatePicture(t.update_ID)
                .subscribe(picture => {
                  if (picture) {
                    this.api.getUpdatePicture(t.update_ID)
                      .subscribe(url => {
                        t.update_Picture = url;
                      })
                  }
                })

              // lat and long
              if (t.update_Location != null) {
                let bstring = t.update_Location.replace('POINT', '').replace('(', '').replace(')', '')
                let lat = bstring.slice(0, bstring.indexOf(" "))
                let long = bstring.slice(bstring.indexOf(" "), bstring.length - 1).trimStart()

                t.up_Lat = lat;
                t.up_Long = long;
              }
            })

            this.taskUpdates = taskUpdates.reverse();
          })
      }
    )
  }

  goBack() {
    this.router.navigate(['../../task-management'], { relativeTo: this.activatedRoute })
  }

  betterDate(dateStr: string) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return date.toLocaleString('en-US', options);
  }

  locationShow(lat: string, long: string) {

    // nice string manipulation
    // let bstring = location.replace('POINT', '').replace('(', '').replace(')', '')
    // let lat = bstring.slice(0, bstring.indexOf(" "))
    // let long = bstring.slice(bstring.indexOf(" "), bstring.length - 1).trimStart()

    let iframeContent = `
    <iframe
    width="380"
    height="250"
    frameborder="0" style="border:0"
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps/embed/v1/place?key=${this.googleMapsAPIKey}&q=${lat},${long}"
    allowfullscreen>
    </iframe>
    `;

    // Show the SweetAlert dialog with the embedded iframe
    Swal.fire({
      title: 'Task Update Location',
      html: iframeContent,
      showCancelButton: false,
      confirmButtonText: 'Close'
    });
  }

  show() {
    this.ref = this.dialogService.open(MiniEmployeeTableComponent, {
      header: 'The Team',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: { employees: this.employees, task: this.myTask }
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
