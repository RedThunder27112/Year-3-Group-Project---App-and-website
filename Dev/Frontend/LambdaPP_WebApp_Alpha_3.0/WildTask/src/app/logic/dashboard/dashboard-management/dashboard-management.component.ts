import { Component, ViewChild } from '@angular/core';
import Request from '../../models/Request';
import { APIService } from '../../api.service'
import Activity from '../../models/Activity';
import Task from '../../models/Task';
import Employee from '../../models/Employee';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import TaskUpdate from '../../models/TaskUpdate';

@Component({
    selector: 'app-dashboard-management',
    templateUrl: './dashboard-management.component.html',
    styleUrls: ['./dashboard-management.component.scss']
})
export class DashboardManagementComponent {

    ongoingTaskCount: number = 0
    freeEmployees: number = 0
    requests: Request[] = []

    barData: any;
    barOptions: any;

    pieData: any
    pieOptions: any

    tasksBarData: any;
    tasksBarOptions: any;

    ratingBarData: any;
    ratingBarOptions: any;

    activities: any[] = [];
    act!: any
    actER!: any

    numTasksPerAct: number[] = [];
    actNames: string[] = [];

    // reporting
    inProgressToday!: any[];
    completedToday!: any[];

    dueToday!: any[]
    overdueToday!: any[]

    taskNums: number[] = new Array(12);

    constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) { }

    stock!: any[]
    employees: Employee[] = []
    ratingsEachEmployee: any[] = []

    tasks!: Task[]
    myTasks: any[] = []
    selectedProduct!: any;

    employeeTaskRatio: number[] = []
    etPieData: any
    etPieOptions: any

    employee!: any

    employeeAvgRatingsPM: any[] = []

    skills!: any[]
    skill!: any

    taskUpdates!: any

    menuItems: MenuItem[] = [];

    topEm: Employee[] = []
    bottomEm: Employee[] = []

    taskWarnings: any[] = []
    taskWarningSkills: any[] = []

    getWarnings(taskID: number)
    {
        this.api.getTaskNoMemberSkill(taskID)
        .subscribe(res => {
            this.taskWarningSkills = res


            let cardsHtml = this.taskWarningSkills
            .map((card: any) => {
                // const cardClass = card.title == "Pro" ? "border-color: rgb(65, 250, 112); border-width: 2px;" : "border-color: rgb(221, 88, 62); border-width: 2px;";
                return `<div class="card" style="border-color: rgb(221, 88, 62); border-width: 2px;"><h5>${card.skill_Name}</h5><p>${card.skill_Description}</p></div>`;
            })
            .join("");
    
            // Show SweetAlert with custom content
            Swal.fire({
                html: cardsHtml,
                confirmButtonText: "OK",
                icon: "info",
                showDenyButton: true,
                denyButtonText: `Edit Task`,
            }).then((result) => {
                if (result.isConfirmed) {
                  // do nothing
                }
                else if (result.isDenied) {
                    this.router.navigate([`../tasks/task-edit/${taskID}`], { relativeTo: this.activatedRoute })
                }
              });
        })

      
    }

    actData: number[] = []
    changeAct() {
        this.actData = []

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

        this.activities.forEach(a => {
            if (a.act_ID == this.act.act_ID) {

                this.api.getEmpCountPerAct(a.act_ID)
                .subscribe(res => {                  

                this.actData.push(this.act.act_Recommended_Min_Emps_Per_Task)
                this.actData.push(res)
                this.actData.push(this.act.act_Recommended_Max_Emps_Per_Task)

                this.barData = {
                    labels: ['Min', 'Value', 'Max'],
                    datasets: [
                        // min
                        {
                            type: 'bar',
                            label: 'Max Employees',
                            backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                            borderColor: documentStyle.getPropertyValue('--primary-500'),
                            data: this.actData
                        }
                    ]
                };

                this.barOptions = {
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: textColorSecondary,
                            },
                            grid: {
                                color: surfaceBorder
                            }
                        },
                        y: {
                            ticks: {
                                color: textColorSecondary,
                                stepSize: 1, // the number of step
                            },
                            grid: {
                                color: surfaceBorder
                            },
                            min: 0,
                            max: 10,
                            beginAtZero: true
                        }
                    }
                }

            })
            }
        })
    }

    getData() {
        this.api.getReportsInProgress()
            .subscribe(res => {
                this.api.getActivities()
                    .subscribe(acts => {
                        acts.forEach(act => {
                            res.forEach(t => {
                                if (act.act_ID == t.act_ID) t.act_Name = act.act_Name
                            })
                        })
                    })

                this.inProgressToday = res
                this.tasks = this.inProgressToday;
            })

        this.api.getReportsCompletedToday()
            .subscribe(res => {

                this.api.getActivities()
                    .subscribe(acts => {
                        acts.forEach(act => {
                            res.forEach(t => {
                                if (act.act_ID == t.act_ID) t.act_Name = act.act_Name
                            })
                        })
                    })

                this.completedToday = res;
                this.tasks = this.completedToday;
            })

        this.api.getReportsDueToday()
            .subscribe(res => {

                this.api.getActivities()
                    .subscribe(acts => {
                        acts.forEach(act => {
                            res.forEach(t => {
                                if (act.act_ID == t.act_ID) t.act_Name = act.act_Name
                            })
                        })
                    })

                this.dueToday = res
                this.tasks = this.dueToday;
            })

        this.api.getReportsOverdueToday()
            .subscribe(res => {

                this.api.getActivities()
                    .subscribe(acts => {
                        acts.forEach(act => {
                            res.forEach(t => {
                                if (act.act_ID == t.act_ID) t.act_Name = act.act_Name
                            })
                        })
                    })

                this.overdueToday = res
                this.tasks = this.overdueToday;
            })
    }

    ceil(arg0: number) {
        return Math.ceil(arg0)
    }

    ngOnInit(): void {

        this.getData()

        this.menuItems = [
            {
                label: 'Set Delivery', icon: 'pi pi-stopwatch',
                command: () => {
                    this.router.navigateByUrl('main/tasks/task-steps/create-task/5');
                }
            }
        ];

        // task to employee ratio
        // this.api.getAllEmployees()
        // .subscribe(res => {
        //     this.employeeTaskRatio.push(res.length)

        //     this.api.getAllTasks()
        //     .subscribe(ts => {
        //         this.employeeTaskRatio.push(ts.length)

        //         this.etPieData = {
        //             labels: ['Employees', 'Tasks'],
        //             datasets: [
        //                 {
        //                     data: this.employeeTaskRatio,
        //                     backgroundColor: [
        //                         documentStyle.getPropertyValue('--indigo-500'),
        //                         documentStyle.getPropertyValue('--purple-500'),
        //                         documentStyle.getPropertyValue('--teal-500')
        //                     ],
        //                     hoverBackgroundColor: [
        //                         documentStyle.getPropertyValue('--indigo-400'),
        //                         documentStyle.getPropertyValue('--purple-400'),
        //                         documentStyle.getPropertyValue('--teal-400')
        //                     ]
        //                 }
        //             ]
        //         };
        //     })
        // })


        this.api.getTaskWithSkillRequiredNoMember()
        .subscribe(res => {
            this.taskWarnings = res
        })

        this.api.getTopRatedEmployeesThisWeek()
        .subscribe(res => {
            this.topEm = res.slice(0, 2)

            this.api.getBottonRatedEmployeesThisWeek()
            .subscribe(res => {
                this.bottomEm = res.slice(0, 2)
            })
        })
        

        this.api.getAllEmployees()
            .subscribe(res => {
                res.forEach(e => {
                    this.api.getProfilePic(e.emp_ID!)
                        .subscribe(url => {
                            e.emp_ID_Image = url;

                            // get monthly average
                            this.api.getAvgRatingPerMonth(e.emp_ID!)
                                .subscribe(r => {
                                    e.emp_AvgRatingsPM = r
                                })

                            this.api.getEmployeeRating(e.emp_ID!)
                                .subscribe
                        })
                })

                this.employees = res

                // this.topEm = res.slice(0, 2)
                // this.bottomEm = res.reverse().slice(3, 5)
            })

        this.api.getSkills()
            .subscribe(sk => {
                this.skills = sk
                // console.log(sk)
            })

        this.api.getCompletedTasksPerMonth()
        .subscribe(comTasks => {
            this.api.getOverdueTasksPerMonth()
            .subscribe(overTasks => {
                this.api.getAvgTaskCompletionRD()
                    .subscribe(res => {
                        this.tasksBarData = {
                            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                            datasets: [
                                // {
                                //     type: 'bar',
                                //     label: 'Average Number of Days Relative to Task Completion',
                                //     // backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                                //     borderColor: documentStyle.getPropertyValue('--primary-500'),
                                //     data: res
                                // },
                                {
                                    type: 'line',
                                    label: 'Completed In Time Per Month',
                                    backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                                    data: comTasks
                                },
                                {
                                    type: 'line',
                                    label: 'Overdue Per Month',
                                    backgroundColor: documentStyle.getPropertyValue('--red-500'),
                                    borderColor: documentStyle.getPropertyValue('--red-500'),
                                    data: overTasks
                                }
                            ]
                        };
    
                        this.tasksBarOptions = {
                            scales: {
                                x: {
                                    title: {
                                        color: 'red',
                                        display: true,
                                        text: 'Month'
                                    },
                                    ticks: {
                                        color: textColorSecondary,
                                        font: {
                                            weight: 500
                                        }
                                    },
                                    grid: {
                                        display: false,
                                        drawBorder: false
                                    }
                                },
                                y: {
                                    title: {
                                        color: 'black',
                                        display: true,
                                        text: 'Number of Tasks'
                                    },
                                    ticks: {
                                        color: textColorSecondary
                                    },
                                    grid: {
                                        color: surfaceBorder,
                                        drawBorder: false
                                    }
                                }
                            }
                        };
                    })
            })
        })

        this.api.getIncompleteTasksCount().subscribe((res) => {
            this.ongoingTaskCount = res
        });

        this.api.getUnresolvedRequests().subscribe((res) => {
            this.requests = res
        });

        

        this.api.getActivities().subscribe((res) => {
            this.activities = res;

            this.activities.forEach(a => {
                this.actNames.push(a.act_Name)
            })

            let overdueTasks: number[] = []

            this.api.getReportsInProgress()
                .subscribe(res => {
                    this.activities.forEach(a => {
                        let counter = 0;
                        res.forEach(t => {
                            if (t.act_ID == a.act_ID) // get only in progress tasks
                            {
                                counter++;
                            }
                        })
                        this.numTasksPerAct.push(counter)
                    })

                    this.api.getReportsOverdueToday()
                        .subscribe(res => {
                            this.activities.forEach(a => {
                                let counter = 0;
                                res.forEach(t => {
                                    if (t.act_ID == a.act_ID) // get only overdue tasks
                                    {
                                        counter++;
                                    }
                                })

                                overdueTasks.push(counter)
                            })

                            this.barData = {
                                labels: this.actNames,
                                datasets: [
                                    {
                                        label: 'In Progress Tasks',
                                        backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                                        borderColor: documentStyle.getPropertyValue('--primary-500'),
                                        data: this.numTasksPerAct
                                    },
                                    {
                                        label: 'Overdue Tasks',
                                        backgroundColor: documentStyle.getPropertyValue('--red-500'),
                                        borderColor: documentStyle.getPropertyValue('--red-500'),
                                        data: overdueTasks
                                    },
                                ]
                            };
                        })
                })
        });

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

        this.barOptions = {
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        stepSize: 1, // the number of step
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        this.api.getAllEmployees()
            .subscribe(res => {
                let numEmp = 0
                let numAdmin = 0
                let numCont = 0

                res.forEach(e => {
                    if (e.emp_IsAdmin) numAdmin++
                    if (e.emp_IsContractor) numCont++
                    else numEmp++
                })

                this.pieData = {
                    labels: ['Administrator', 'Contractor', 'Employee'],
                    datasets: [
                        {
                            data: [numAdmin, numCont, numEmp],
                            backgroundColor: [
                                documentStyle.getPropertyValue('--indigo-500'),
                                documentStyle.getPropertyValue('--purple-500'),
                                documentStyle.getPropertyValue('--teal-500')
                            ],
                            hoverBackgroundColor: [
                                documentStyle.getPropertyValue('--indigo-400'),
                                documentStyle.getPropertyValue('--purple-400'),
                                documentStyle.getPropertyValue('--teal-400')
                            ]
                        }
                    ]
                };
            })

        this.pieOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };

        // stock / equipment reporting
        this.api.getLowStockReport()
        .subscribe(res => {
            res.forEach((e: any) => {
                this.api.getStockImage(e.stock_ID)
                    .subscribe(url => {
                        e.stock_Image = url;
                    })

                this.api.getLowStock(e.stock_ID)
                .subscribe(res => {
                  e.Low_Stock = res;
                  console.log("stock", e);
                })

                this.api.getAllStock()
                    .subscribe(st => {
                        res.forEach((r: any) => {
                            st.forEach(s => {
                                if (s.stock_ID == r.stock_ID) {
                                    r.stock_Name = s.stock_Name
                                }
                            })
                        })
                    })
            });


            this.stock = res
        })

        // task updates
        this.api.taskUpdatesForDash(formatDate(new Date(),'yyyy-MM-dd','en'))
        .subscribe(res => {

            res.forEach((up: any) => {
                this.api.getTask(up.task_ID)
                .subscribe(res2 => {
                    up.task_Name = res2.task_Name
                    this.api.getEmployee(up.emp_ID)
                    .subscribe(res3 => {
                        up.emp_Name = res3.emp_Name
                        this.api.getProfilePic(up.emp_ID)
                        .subscribe(url => {
                            up.pic = url
                        })
                    })
                })
            })
            
            this.taskUpdates = res.reverse() // topmost update first
            console.log(res)
        })
    }


    tasksThreeMonths() {
        let jul = 0
        let aug = 0
        let sep = 0

        this.myTasks.forEach((t: Task) => {
            let month = new Date(t.task_Date_Started).getMonth() + 1;

            if (month == 7) jul++
            if (month == 8) aug++
            if (month == 9) sep++
        })

        this.taskNums[0] = jul
        this.taskNums[1] = aug
        this.taskNums[2] = sep

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

        this.tasksBarData = {
            labels: ['July', 'August', 'September'],
            datasets: [
                {
                    label: 'Num of Tasks in the last 3 Months',
                    backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: this.taskNums
                }
            ]
        };

        this.tasksBarOptions = {
            scales: {
                x: {
                    title: {
                        color: 'red',
                        display: true,
                        text: 'Month'
                    },
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    taskSixMonths() {
        let apr = 0
        let may = 0
        let jun = 0
        let jul = 0
        let aug = 0
        let sep = 0

        this.myTasks.forEach((t: Task) => {
            let month = new Date(t.task_Date_Started).getMonth() + 1;

            if (month == 4) apr++
            if (month == 5) may++
            if (month == 6) jun++
            if (month == 7) jul++
            if (month == 8) aug++
            if (month == 9) sep++
        })

        this.taskNums[0] = apr
        this.taskNums[1] = may
        this.taskNums[2] = jun
        this.taskNums[3] = jul
        this.taskNums[4] = aug
        this.taskNums[5] = sep

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

        this.tasksBarData = {
            labels: ['April', 'May', 'June', 'July', 'August', 'September'],
            datasets: [
                {
                    label: 'Num of Tasks in the Last 6 Months',
                    backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: this.taskNums
                }
            ]
        };

        this.tasksBarOptions = {
            scales: {
                x: {
                    title: {
                        color: 'red',
                        display: true,
                        text: 'Month'
                    },
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    ratingOverTimeBtn = false
    activateRatingBtn()
    {
        if(this.employee != null)
        {
            this.ratingOverTimeBtn = true
        }
    }
    clearRatingFilters()
    {
        this.employee = null
        this.actER = null
        this.ratingOverTimeBtn = false

        this.ratingBarData = null
        this.ratingBarOptions = null
    }

    getRatingOverTime() {
        this.employees.forEach(e => {
            if (e.emp_ID == this.employee.emp_ID!) {
                let employeeNames: string[] = []
                this.employees.forEach(em => {
                    employeeNames.push(em.emp_Name)
                })

                let ratingsNums: number[] = new Array(12);
                this.api.getOverallEmployeeRating()
                    .subscribe(res => {
                        ratingsNums = res

                        const documentStyle = getComputedStyle(document.documentElement);
                        const textColor = documentStyle.getPropertyValue('--text-color');
                        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
                        const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

                        if(this.actER == null)
                        {

                            this.ratingBarData = {
                                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                                datasets: [
                                    {
                                        type: 'line',
                                        label: 'Employee Rating',
                                        backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                                        borderColor: documentStyle.getPropertyValue('--primary-500'),
                                        data: e.emp_AvgRatingsPM
                                    },
                                    {
                                        type: 'line',
                                        label: 'Average Employee Rating',
                                        backgroundColor: documentStyle.getPropertyValue('--purple-500'),
                                        borderColor: documentStyle.getPropertyValue('--purple-500'),
                                        data: ratingsNums
                                    }
                                ]
                            };
    
                            this.ratingBarOptions = {
                                scales: {
                                    x: {
                                        title: {
                                            color: 'black',
                                            display: true,
                                            text: 'Month'
                                        },
                                        ticks: {
                                            color: textColorSecondary,
                                            font: {
                                                weight: 500
                                            }
                                        },
                                        grid: {
                                            display: false,
                                            drawBorder: false
                                        }
                                    },
                                    y: {
                                        title: {
                                            color: 'black',
                                            display: true,
                                            text: 'Rating'
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
                                            drawBorder: false
                                        }
                                    }
                                }
                            };
                        }                        
                        else
                        {
                            this.api.getEmployeeRatingPerAct(this.employee.emp_ID!, this.actER.act_ID!)
                            .subscribe(actData => {
                                this.api.getAvgRatingPerAct(this.actER.act_ID!)
                                .subscribe(avgActData => {
                                    this.ratingBarData = {
                                        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                                        datasets: [
                                            {
                                                type: 'line',
                                                label: 'Employee Rating',
                                                backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                                                borderColor: documentStyle.getPropertyValue('--primary-500'),
                                                data: e.emp_AvgRatingsPM
                                            },
                                            {
                                                type: 'line',
                                                label: 'Average Employee Rating',
                                                backgroundColor: documentStyle.getPropertyValue('--purple-500'),
                                                borderColor: documentStyle.getPropertyValue('--purple-500'),
                                                data: ratingsNums
                                            },
                                            {
                                                type: 'line',
                                                label: 'Employee Activity Rating',
                                                backgroundColor: documentStyle.getPropertyValue('--teal-500'),
                                                borderColor: documentStyle.getPropertyValue('--teal-500'),
                                                data: actData
                                            },
                                            {
                                                type: 'line',
                                                label: 'Average Activity Rating',
                                                backgroundColor: documentStyle.getPropertyValue('--red-500'),
                                                borderColor: documentStyle.getPropertyValue('--red-500'),
                                                data: avgActData
                                            }
                                        ]
                                    };
                                })
                            })
                        }
                })
            }

        })

    }
}
