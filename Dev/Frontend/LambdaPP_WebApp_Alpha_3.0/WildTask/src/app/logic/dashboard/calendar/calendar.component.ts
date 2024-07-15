import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { APIService } from '../../api.service';
import Task from '../../models/Task';
import { ActivatedRoute, Router } from '@angular/router';

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  purple: {
    primary: '#ad21ad',
    secondary: '#FAE3E3',
  },
  orange: {
    primary: '#ff8f1e',
    secondary: '#D1E8FF',
  },
  green: {
    primary: '#6ae308',
    secondary: '#FDF1BA',
  }
};

@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      h3 {
        margin: 0 0 10px;
      }

      pre {
        background-color: #f5f5f5;
        padding: 15px;
      }
    `,
  ],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  @ViewChild('modalContent', { static: false }) modalContent!: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) {}

  allTasks: CalendarEvent[] = [];
  filteredTasks: CalendarEvent[] = [];
  allActs!: any[]
  myTasks: Task[] = []

  isLoading!: boolean;

  events: CalendarEvent[] = [];

  ngOnInit() {
    this.api.getActivities()
    .subscribe(acts => {

      this.allActs = acts
      acts.forEach(act => {
        this.api.getActivitiesWithTasks(act.act_ID)
        .subscribe((myAct: any) => {
          myAct.tasks.forEach((t: any) => {

            this.isLoading = true;
            
            // add all tasks
            this.myTasks.push(t)

            if(act.act_ID == 1)
            {
              let obj = {
                id: t.task_ID,
                start: new Date(t.task_Date_Started),
                end: new Date(t.task_Deadline),
                title: t.task_Name,
                color:  { ...colors['blue'] },
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: false,
              }
      
              this.allTasks.push(obj)
            }
            else if (act.act_ID == 2)
            {
              let obj = {
                id: t.task_ID,
                start: new Date(t.task_Date_Started),
                end: new Date(t.task_Deadline),
                title: t.task_Name,
                color:  { ...colors['green'] },
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: false,
              }
      
              this.allTasks.push(obj) 
            }
            else if (act.act_ID == 3)
            {
              let obj = {
                id: t.task_ID,
                start: new Date(t.task_Date_Started),
                end: new Date(t.task_Deadline),
                title: t.task_Name,
                color:  { ...colors['purple'] },
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: false,
              }
      
              this.allTasks.push(obj) 
            }
            else if (act.act_ID == 4)
            {
              let obj = {
                id: t.task_ID,
                start: new Date(t.task_Date_Started),
                end: new Date(t.task_Deadline),
                title: t.task_Name,
                color:  { ...colors['orange'] },
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: false,
              }
      
              this.allTasks.push(obj) 
            }
            else if (act.act_ID == 5)
            {
              let obj = {
                id: t.task_ID,
                start: new Date(t.task_Date_Started),
                end: new Date(t.task_Deadline),
                // end: ,
                title: t.task_Name,
                color:  { ...colors['yellow'] },
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: false,
              }
      
              this.allTasks.push(obj) 
            }
            else if (act.act_ID == 6)
            {
              let obj = {
                id: t.task_ID,
                start: new Date(t.task_Date_Started),
                end: new Date(t.task_Deadline),
                title: t.task_Name,
                color:  { ...colors['red'] },
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: false,
              }
      
              this.allTasks.push(obj) 
            }

            this.events = this.allTasks;
            this.isLoading = false;
          })
        })
      })
    })
  }

  clearFilter()
  {
    this.events = this.allTasks
    this.filteredTasks = []
  }

  filterTasks(actID: number)
  {
    this.filteredTasks = []

    this.myTasks.forEach(t => {
      if(t.act_ID == actID)
      {
        if(actID == 1)
        {
          let obj = {
            start: new Date(t.task_Date_Started),
            end: new Date(t.task_Deadline),
            title: t.task_Name,
            color:  { ...colors['blue'] },
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: false,
          }
  
          this.filteredTasks.push(obj)
        }
        else if (actID == 2)
        {
          let obj = {
            start: new Date(t.task_Date_Started),
            end: new Date(t.task_Deadline),
            title: t.task_Name,
            color:  { ...colors['green'] },
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: false,
          }
  
          this.filteredTasks.push(obj) 
        }
        else if (actID == 3)
        {
          let obj = {
            start: new Date(t.task_Date_Started),
            end: new Date(t.task_Deadline),
            title: t.task_Name,
            color:  { ...colors['purple'] },
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: false,
          }
  
          this.filteredTasks.push(obj) 
        }
        else if (actID == 4)
        {
          let obj = {
            start: new Date(t.task_Date_Started),
            end: new Date(t.task_Deadline),
            title: t.task_Name,
            color:  { ...colors['orange'] },
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: false,
          }
  
          this.filteredTasks.push(obj) 
        }
        else if (actID == 5)
        {
          let obj = {
            start: new Date(t.task_Date_Started),
            end: new Date(t.task_Deadline),
            title: t.task_Name,
            color:  { ...colors['yellow'] },
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: false,
          }
  
          this.filteredTasks.push(obj) 
        }
        else if (actID == 6)
        {
          let obj = {
            start: new Date(t.task_Date_Started),
            end: new Date(t.task_Deadline),
            title: t.task_Name,
            color:  { ...colors['red'] },
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: false,
          }
  
          this.filteredTasks.push(obj) 
        }
      }
    })

    this.events = this.filteredTasks;
  }

  modalData!: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  activeDayIsOpen: boolean = false;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  spinnerSize = 100;

  handleEvent(action: string, event: CalendarEvent): void {
    let taskName = event.title;

    this.myTasks.forEach(t => {
      if(t.task_Name == taskName)
      {
        this.router.navigate(['../../tasks/task-detail', t.task_ID], { relativeTo: this.activatedRoute })
      }
    })
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        // color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
