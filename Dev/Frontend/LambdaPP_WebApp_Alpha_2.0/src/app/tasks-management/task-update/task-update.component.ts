import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import TaskUpdate from 'src/app/models/TaskUpdate';
import { APIService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-update',
  templateUrl: './task-update.component.html',
  styleUrls: ['./task-update.component.scss']
})
export class TaskUpdateComponent {

  taskID!: number
  taskUpdates!: TaskUpdate[]
  googleMapsAPIKey = "AIzaSyCyvyXekvBbyO2CFpjApWDlo_qANjm0QdE"
  
  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder,
              private toastr: ToastrService) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      val => {
        this.taskID = val['taskID'];
        this.api.getTaskUpdates(this.taskID)
        .subscribe(taskUpdates => {

          taskUpdates.forEach(t => {
            this.api.getProfilePic(t.employee.emp_ID)
            .subscribe(url => {
              t.employee.emp_ID_Image = url;
            })
          })
          
          this.taskUpdates = taskUpdates;
        })
      }
      )
    }

  goBack() {
    this.router.navigate(['../../task-management'], {relativeTo: this.activatedRoute})
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

  locationShow(location: string) {

    this.toastr.success("Task Created Successfully", "Success", {
      positionClass: 'toast-bottom-center',
      timeOut: 2000
    })

    // Swal.mixin({
    //   toast: true,
    //   position: 'top-end',
    //   showConfirmButton: false,
    //   timer: 3000,
    //   timerProgressBar: true,
    //   background: '#d4ffc9',
    //   color: '#000000'
    // }).fire({
    //   icon: 'success',
    //   title: 'Task Created Successfully',
    // });
    

    // nice string manipulation
    let bstring = location.replace('POINT', '').replace('(', '').replace(')', '')
    let lat = bstring.slice(0, bstring.indexOf(" "))
    let long = bstring.slice(bstring.indexOf(" "), bstring.length - 1).trimStart()

    const iframeContent = `
    <iframe
    width="450"
    height="250"
    frameborder="0" style="border:0"
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps/embed/v1/place?key=${this.googleMapsAPIKey}&q=${lat},${long}"
    allowfullscreen>
    </iframe>
    `;

    // Show the SweetAlert dialog with the embedded iframe
    // Swal.fire({
    //   title: 'Task Location',
    //   html: iframeContent,
    //   showCancelButton: false,
    //   confirmButtonText: 'Close'
    // });
  }
}
