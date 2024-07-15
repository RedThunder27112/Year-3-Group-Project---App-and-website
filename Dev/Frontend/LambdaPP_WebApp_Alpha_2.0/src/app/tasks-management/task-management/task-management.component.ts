import {Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import Task from 'src/app/models/Task';
import { APIService } from 'src/app/services/api.service';
import * as lodash from 'lodash';
import Activity from 'src/app/models/Activity';
import { Table } from 'primeng/table';

// import './task-management.component.scss';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit {

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) {}

  // prime stuff
  loading = true;

  clear(table: Table) {
    table.clear();
  }

  public dataSource!: MatTableDataSource<Task>;
  public tasks!: Task[];
  public activities!: Activity[];
  
  displayedColumns: string[] = ['tName', 'startDate', 'deadlineDate', 'activity', 'status', 'action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
      this.api.getActivities()
      .subscribe(activities => {
        this.activities = activities;
      })

      this.api.getAllTasks()
      .subscribe(tasks => {
        tasks.forEach(task => {
          if(this.activities != undefined)
          {
            this.activities.forEach(act => {
              if(task.act_ID == act.act_ID) task.act_Name = act.act_Name
            })
          }
        })

        this.tasks = tasks;
        this.dataSource = new MatTableDataSource(this.tasks);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.loading = false;

      })
    }

  applyFilter(event: Event)
  {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if(this.dataSource.paginator)
    {
      this.dataSource.paginator.firstPage();
    }
  }

  onStatus($event: any) {
    let filteredData = lodash.filter(this.tasks, (item : any) => {
      return item.status.status_Name.toLowerCase() == $event.value
    })
    
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  onActivity($event: any) {
    let filteredData = lodash.filter(this.tasks, (item : any) => {
      return item.act_Name == $event.value
    })
    
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  reset() {
    this.dataSource = new MatTableDataSource(this.tasks);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  goToCreateTask() {
    this.router.navigate(['../create-task'], {relativeTo: this.activatedRoute})
  }
  
  goToCreateActivity() {
    this.router.navigate(['../create-activity'], {relativeTo: this.activatedRoute})
  }

  goToTaskUpdate(row: Task) {
    this.router.navigate(['../task-update', row.task_ID], {relativeTo: this.activatedRoute})
  }
}
