import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent {

  breadcrumbItems: MenuItem[] = [];
  
  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Electronics' });
    this.breadcrumbItems.push({ label: 'Computer' });
    this.breadcrumbItems.push({ label: 'Notebook' });
    this.breadcrumbItems.push({ label: 'Accessories' });
    this.breadcrumbItems.push({ label: 'Backpacks' });
    this.breadcrumbItems.push({ label: 'Item' });
  }

}
