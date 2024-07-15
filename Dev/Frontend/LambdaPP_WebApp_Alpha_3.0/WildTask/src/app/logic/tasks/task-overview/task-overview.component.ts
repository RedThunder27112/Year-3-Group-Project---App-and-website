import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { APIService } from '../../api.service';
import Activity from '../../models/Activity';
import Task from '../../models/Task';
import { MenuItem, MessageService } from 'primeng/api';

export interface Product {
  name: string
  description: string
}

@Component({
  selector: 'app-task-overview',
  templateUrl: './task-overview.component.html',
  styleUrls: ['./task-overview.component.scss'],
  providers: [MessageService]
})
export class TaskOverviewComponent implements OnInit {

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private messageService: MessageService) { }

  statuses = ["IN PROGRESS", "AWAITING REVIEW", "RESOURCES ALLOCATED", "COMPLETED"]

  // prime stuff
  loading = true;

  @ViewChild('dt1') table!: Table;
  selectedDate!: Date | null;

  startDate: Date | null = null;
  endDate: Date | null = null;
  nextDay: Date | null = null;

  getSeverity(status: string) 
  {
    if(status == "IN PROGRESS") return 'info';
    else if(status == "COMPLETED") return 'success';
    else if(status == "RESOURCES ALLOCATED") return '';
    else if(status == "AWAITING REVIEW") return 'warning';
    else return ""
  } 

  public tasks!: Task[];
  public allTasks!: Task[];
  public filteredTasks!: Task[];
  public activities!: Activity[];
  public acts: string[] = [];
 
  taskStatus!: any;
  taskAct!: any;

  ngOnInit(): void {
    this.api.getActivities()
    .subscribe(activities => {
      this.activities = activities;

      activities.forEach(act => {
        this.acts.push(act.act_Name)

        this.api.getAllTasks()
        .subscribe(tasks => {
          tasks.forEach(task => {
            if (this.activities != undefined) {
              this.activities.forEach(act => {
                if (task.act_ID == act.act_ID) task.act_Name = act.act_Name
              })
            }
          })

          this.allTasks = tasks.reverse(); // shows latest top most tasks first
          this.tasks = this.allTasks;
          this.loading = false;
        })
      })
    })
  }

  dateFilter() {
    if (this.startDate != null) {
      this.api.getTasksAfter(this.startDate)
        .subscribe(res => {
          console.log(res)
          res.forEach((task: any) => {
            this.activities.forEach(act => {
              if (task.act_ID == act.act_ID) task.act_Name = act.act_Name
            })
          })

          this.filteredTasks = res;
          this.tasks = this.filteredTasks
        })

      this.nextDay = new Date(this.startDate);
      this.nextDay.setDate(this.nextDay.getDate() + 1);
    }
  }

  dateFilterBetween()
  {
    if(this.startDate != null && this.endDate != null)
    {
      this.api.getTasksBetween(this.startDate, this.endDate)
        .subscribe(res => {
          console.log(res)
          res.forEach((task: any) => {
            this.activities.forEach(act => {
              if (task.act_ID == act.act_ID) task.act_Name = act.act_Name
            })
          })
          this.tasks = res
        })
    }
  }

  resetStartFilter()
  {
    this.startDate = null;
    this.endDate = null;
    this.tasks = this.allTasks;
  }

  resetEndFilter() 
  {
    this.endDate = null;
    this.tasks = this.filteredTasks;
  }

  clear(table: Table) {
    table.clear();
    this.resetStartFilter()
    this.taskAct = null;
    this.taskStatus = null;
  }
}

