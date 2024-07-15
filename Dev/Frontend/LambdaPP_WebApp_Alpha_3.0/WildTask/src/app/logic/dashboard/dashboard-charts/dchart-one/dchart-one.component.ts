import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { APIService } from '../../../api.service';
import Employee from '../../../models/Employee';

@Component({
  selector: 'app-dchart-one',
  templateUrl: './dchart-one.component.html',
  styleUrls: ['./dchart-one.component.scss'],
})
export class DchartOneComponent implements OnInit {
  tieredItems: MenuItem[] = [];

  employees: Employee[] = [];
  employee!: any;

  activities: any[] = [];
  act!: any;
  actER!: any;

  ratingBarData: any;
  ratingBarOptions: any;

  tasksBarData: any;
  tasksBarOptions: any;

  // display
  display = false;
  employeeDisplay = false;
  taskDisplay = false;

  graphTitle: string = ""

  constructor(private api: APIService) {}

  ngOnInit() {
    this.tieredItems = [
      {
        label: 'Employees',
        icon: 'pi pi-fw pi-user',
        command: () => {
          this.display = true;
          this.employeeDisplay = true;
          this.taskDisplay = false;

          this.graphTitle = "Employee Performance Over Time"
        },
      },
      {
        label: 'Tasks',
        icon: 'fa fa-tasks',
        items: [
          {
            label: 'Number of Tasks',
            command: () => {
              this.display = true;
              this.taskDisplay = true;
              this.employeeDisplay = false;

              this.graphTitle = "Number of Tasks Per Month"
              this.getNumTaskGraphs();
            },
          },
          {
            label: 'Task Completion Relative to Deadline',
            command: () => {
              this.display = true;
              this.taskDisplay = true;
              this.employeeDisplay = false;

              this.graphTitle = "Average Task Completion Relative To Deadline"
              this.getAvgTaskCompletionRD();
            },
          },
        ],
      },
      { separator: true },
      {
        label: 'Clear',
        icon: 'pi pi-trash',
        command: () => {
          this.display = false;
          this.taskDisplay = false;
          this.employeeDisplay = false;
        },
      },
    ];

    this.api.getAllEmployees().subscribe((res) => {
      res.forEach((e) => {
        this.api.getProfilePic(e.emp_ID!).subscribe((url) => {
          e.emp_ID_Image = url;

          // get monthly average
          this.api.getAvgRatingPerMonth(e.emp_ID!).subscribe((r) => {
            e.emp_AvgRatingsPM = r;
          });

          // this.api.getEmployeeRating(e.emp_ID!).subscribe;
        });
      });

      this.employees = res;
    });

    this.api.getActivities().subscribe((res) => {
      this.activities = res;
    });
  }

  // Tasks
  taskOverTimeBtn = false;
  activateTaskBtn() {
    if (this.employee != null) {
      this.ratingOverTimeBtn = true;
    }
  }
  clearTaskFilters() {
    this.employee = null;
    this.actER = null;
    this.ratingOverTimeBtn = false;

    this.ratingBarData = null;
    this.ratingBarOptions = null;
  }

  getNumTaskGraphs() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.api.getCompletedTasksPerMonth().subscribe((comTasks) => {
      this.api.getOverdueTasksPerMonth().subscribe((overTasks) => {
        this.api.getAvgTaskCompletionRD().subscribe((res) => {
          this.tasksBarData = {
            labels: [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ],
            datasets: [
              {
                type: 'line',
                label: 'Completed In Time Per Month',
                backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                data: comTasks,
              },
              {
                type: 'line',
                label: 'Overdue Per Month',
                backgroundColor: documentStyle.getPropertyValue('--red-500'),
                borderColor: documentStyle.getPropertyValue('--red-500'),
                data: overTasks,
              },
            ],
          };

          this.tasksBarOptions = {
            scales: {
              x: {
                title: {
                  color: 'red',
                  display: true,
                  text: 'Month',
                },
                ticks: {
                  color: textColorSecondary,
                  font: {
                    weight: 500,
                  },
                },
                grid: {
                  display: false,
                  drawBorder: false,
                },
              },
              y: {
                title: {
                  color: 'black',
                  display: true,
                  text: 'Number of Tasks',
                },
                ticks: {
                  color: textColorSecondary,
                },
                grid: {
                  color: surfaceBorder,
                  drawBorder: false,
                },
              },
            },
          };
        });
      });
    });
  }

  getAvgTaskCompletionRD() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.api.getAvgTaskCompletionRD().subscribe((res) => {
      this.tasksBarData = {
        labels: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        datasets: [
          {
              type: 'bar',
              label: 'Completion Date (Positive Values Are After Deadline)',
              backgroundColor: documentStyle.getPropertyValue('--primary-500'),
              borderColor: documentStyle.getPropertyValue('--primary-500'),
              data: res
          },
        ],
      };

      this.tasksBarOptions = {
        scales: {
          x: {
            title: {
              color: 'red',
              display: true,
              text: 'Month',
            },
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              display: false,
              drawBorder: false,
            },
          },
          y: {
            title: {
              color: 'black',
              display: true,
              text: 'Days Deviation from Deadline',
            },
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
    });
  }

  // Employees
  ratingOverTimeBtn = false;
  activateRatingBtn() {
    if (this.employee != null) {
      this.ratingOverTimeBtn = true;
    }
  }
  clearRatingFilters() {
    this.employee = null;
    this.actER = null;
    this.ratingOverTimeBtn = false;

    this.ratingBarData = null;
    this.ratingBarOptions = null;
  }

  getRatingOverTime() {
    this.employees.forEach((e) => {
      if (e.emp_ID == this.employee.emp_ID!) {
        let employeeNames: string[] = [];
        this.employees.forEach((em) => {
          employeeNames.push(em.emp_Name);
        });

        let ratingsNums: number[] = new Array(12);
        this.api.getOverallEmployeeRating().subscribe((res) => {
          ratingsNums = res;

          const documentStyle = getComputedStyle(document.documentElement);
          const textColor = documentStyle.getPropertyValue('--text-color');
          const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
          );
          const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

          if (this.actER == null) {
            this.ratingBarData = {
              labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ],
              datasets: [
                {
                  type: 'line',
                  label: 'Employee Rating',
                  backgroundColor:
                    documentStyle.getPropertyValue('--primary-500'),
                  borderColor: documentStyle.getPropertyValue('--primary-500'),
                  data: e.emp_AvgRatingsPM,
                },
                {
                  type: 'line',
                  label: 'Average Employee Rating',
                  backgroundColor:
                    documentStyle.getPropertyValue('--purple-500'),
                  borderColor: documentStyle.getPropertyValue('--purple-500'),
                  data: ratingsNums,
                },
              ],
            };

            this.ratingBarOptions = {
              scales: {
                x: {
                  title: {
                    color: 'black',
                    display: true,
                    text: 'Month',
                  },
                  ticks: {
                    color: textColorSecondary,
                    font: {
                      weight: 500,
                    },
                  },
                  grid: {
                    display: false,
                    drawBorder: false,
                  },
                },
                y: {
                  title: {
                    color: 'black',
                    display: true,
                    text: 'Rating',
                  },
                  ticks: {
                    color: textColorSecondary,
                    stepSize: 0.5, // the number of step
                  },
                  min: 0,
                  max: 5.5,
                  beginAtZero: true,

                  grid: {
                    color: surfaceBorder,
                    drawBorder: false,
                  },
                },
              },
            };
          } else {
            this.api
              .getEmployeeRatingPerAct(
                this.employee.emp_ID!,
                this.actER.act_ID!
              )
              .subscribe((actData) => {
                this.api
                  .getAvgRatingPerAct(this.actER.act_ID!)
                  .subscribe((avgActData) => {
                    this.ratingBarData = {
                      labels: [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                      ],
                      datasets: [
                        {
                          type: 'line',
                          label: 'Employee Rating',
                          backgroundColor:
                            documentStyle.getPropertyValue('--primary-500'),
                          borderColor:
                            documentStyle.getPropertyValue('--primary-500'),
                          data: e.emp_AvgRatingsPM,
                        },
                        {
                          type: 'line',
                          label: 'Average Employee Rating',
                          backgroundColor:
                            documentStyle.getPropertyValue('--purple-500'),
                          borderColor:
                            documentStyle.getPropertyValue('--purple-500'),
                          data: ratingsNums,
                        },
                        {
                          type: 'line',
                          label: 'Employee Activity Rating',
                          backgroundColor:
                            documentStyle.getPropertyValue('--teal-500'),
                          borderColor:
                            documentStyle.getPropertyValue('--teal-500'),
                          data: actData,
                        },
                        {
                          type: 'line',
                          label: 'Average Activity Rating',
                          backgroundColor:
                            documentStyle.getPropertyValue('--red-500'),
                          borderColor:
                            documentStyle.getPropertyValue('--red-500'),
                          data: avgActData,
                        },
                      ],
                    };
                  });
              });
          }
        });
      }
    });
  }
}
