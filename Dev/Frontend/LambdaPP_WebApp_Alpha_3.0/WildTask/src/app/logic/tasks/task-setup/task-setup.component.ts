import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-task-setup',
  templateUrl: './task-setup.component.html',
  styleUrls: ['./task-setup.component.scss']
})
export class TaskSetupComponent implements OnInit {

  breadcrumbItems: MenuItem[] = [];

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../' });
    this.breadcrumbItems.push({ label: 'Task Setup', routerLink: ['../../task-setup'] });
  }

}
