import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { APIService } from '../../api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-sites',
  templateUrl: './task-sites.component.html',
  styleUrls: ['./task-sites.component.scss'],
  providers: [MessageService]
})
export class TaskSitesComponent {

  breadcrumbItems: MenuItem[] = [];
  taskSites!: any[]
  googleMapsAPIKey = "AIzaSyCyvyXekvBbyO2CFpjApWDlo_qANjm0QdE"

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute, private messageService: MessageService) {}

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../' });
    this.breadcrumbItems.push({ label: 'Task Sites', routerLink: ['../../task-sites'] });

    this.api.getLocations()
    .subscribe(res => {
      this.taskSites = res
    })
  }

  locationShow(location: string) {

    // nice string manipulation
    let bstring = location.replace('POINT', '').replace('(', '').replace(')', '')
    let lat = bstring.slice(0, bstring.indexOf(" "))
    let long = bstring.slice(bstring.indexOf(" "), bstring.length - 1).trimStart()

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
      title: 'Task Site Location',
      html: iframeContent,
      showCancelButton: false,
      confirmButtonText: 'Close'
    });
  }
}
