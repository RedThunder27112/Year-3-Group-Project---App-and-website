import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService} from '../../api.service'
import Employee from '../../models/Employee';
import SkillWithLevel from '../../models/SkillWithLevel';
import Rating from '../../models/Rating';
import { DataView } from 'primeng/dataview';
import Activity from '../../models/Activity';
import { MenuItem } from 'primeng/api';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent {

  employee!: Employee;
  skills: SkillWithLevel[] = [];
  ratingCount: number = 0;
  ratings: Rating[] = [];

  selectedActivity: Activity|null = null;
  selectedActivityAvgRating: number = 0;

  sortOrder: number = -1;
  sortField: string = "rating_Date";
  activityOptions = ["All"];
  activities: Activity[] = [];
  defaultOption = this.activityOptions.at(0);

  starNumbers = Array(5).fill(1).map((x,i)=>i);

  sortOptions = ["Most Recent", "Highest Ratings", "Lowest Ratings"];

  breadcrumbItems: MenuItem[] = [];

  tasksCompletedCount: number = 0;
  tasksCompletedLateCount: number = 0;
  tasksCompletedEarlyCount: number = 0;
  tasksSupervisedCount: number = 0;
  tasksAvgDateCompleted: number = 0;

  tasksIncompleteCount: number = 0;
  tasksThatShouldBeInProgressCount: number = 0;
  tasksUpcomingCount: number = 0;
  tasksSupervisingCount: number = 0;
  tasksDueTodayCount: number = 0;
  tasksAvgDateCompletedForAll: number = 0;
 
  docCount: number = 0;
  pdfSrcs: String[] = [];

  mostCommonComment: KeyValue<number, string> | undefined
  mostCommonPositive: KeyValue<number, string> | undefined
  mostCommonNegative: KeyValue<number, string> | undefined

  avgRatingPerMonth: number[] = [];
  avgSentimentPerMonth: number[] = [];
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
  monthCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  ratingsBarData: any;
  ratingsBarOptions: any;

  showAllReviews: Boolean = false;

  // rating categories
  getRatingCategory(ratingCat: number)
  {
    if(ratingCat == 1) return "POSITIVE"
    else if (ratingCat == 2) return "NEUTRAL"
    else if (ratingCat == 3) return "NEGATIVE"
    else return "UNDEFINED"
  }

  getSeverity(ratingCat: number) 
  {
    if(ratingCat == 1) return "success"
    else if (ratingCat == 2) return "info"
    else if (ratingCat == 3) return "danger"
    else return ""
  }

  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  pieDataCompleted: any;
  pieDataCurrent: any;
  pieOptions: any = {
    plugins: {
        legend: {
            labels: {
                usePointStyle: true,
                color: this.textColor
            }
        }
    }
  };
  

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) {}
  ngOnInit(): void {
    let empID = this.activatedRoute.snapshot.paramMap.get('id')
    if (empID == null) {
      this.goBack();
      return;
    }
    let empIDNum = parseInt(empID)
    if ((Number.isNaN(empIDNum))) {
      console.log("Not a number:", empID)
      this.goBack();
      return;
    }

    // breadcrumbs
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Employees', routerLink: '../../../' });
    this.breadcrumbItems.push({ label: 'Employee Details', routerLink: ['../../detail', empID] });
    
    this.api.getEmployee(empIDNum).subscribe(res => {
      this.employee = res
      // adding an image
      this.api.getProfilePic(empIDNum)
        .subscribe(url => {
          this.employee.emp_ID_Image = url;
        })

      this.api.getEmployeeSkills(empIDNum).subscribe((res) => {
        this.skills = res;
      });

      //get the rating count. If there are ratings, then we can try getting the ratings, getting the reviewer who made the rating, and getting the task associated with the rating
      this.api.getEmployeeRatingCount(empIDNum).subscribe((res) => {
        this.ratingCount = res;

        if (this.ratingCount != 0)
        {
          this.api.getEmployeeRatings(empIDNum).subscribe((res2) => {
            res2.forEach(element => {
              //for each rating, get the employee who posted it and the task it was associated with
              this.api.getEmployee(element.reviewer_ID).subscribe((res3) => {
                element.reviewer = res3;
              })
              
              this.api.getTask(element.task_ID).subscribe((res3) => {
                element.task = res3;
                //add the activity to the list of activities to filter by, if it's not already there
                if (this.activityOptions.findIndex((act) => act == res3.activity.act_Name) == -1)
                  this.activityOptions.push(res3.activity.act_Name)
                  this.activities.push(res3.activity)
              })
            });
  
            this.ratings = res2;
          });
        }
      });

      this.api.getDocCount(empIDNum).subscribe(count => {
        this.docCount = count;
        for (let i = 0; i < this.docCount; i++)
        {
          this.api.getDoc(empIDNum,1)
          .subscribe(url => {
            this.pdfSrcs.push(url);
          })
        }
      })
      

    

      //get employee stats

      //things to add: 
      //how busy are they - the schedule page will talk more about this

      //stats:
      //num tasks completed
      this.api.getEmployeeTasksCompleted(empIDNum).subscribe((res2) => {
        console.log("TasksCompleted",res2)
        this.tasksCompletedCount = res2.length;

        if (this.tasksCompletedCount != 0)
        {
          //num tasks completed past due date - and as %
          this.api.getEmployeeTasksCompletedOverDueDate(empIDNum).subscribe((res3) => {
            this.tasksCompletedLateCount = res3.length;
            //num tasks completed early - and as %
            this.api.getEmployeeTasksCompletedEarly(empIDNum).subscribe((res4) => {
              this.tasksCompletedEarlyCount = res4.length;

              //pie chart of the above?
              this.pieDataCompleted = {
                labels: ['Completed Early', 'Completed on due date', 'Completed late'],
                datasets: [
                    {
                        data: [this.tasksCompletedEarlyCount, this.tasksCompletedCount - this.tasksCompletedEarlyCount - this.tasksCompletedLateCount, this.tasksCompletedLateCount],
                        backgroundColor: [
                            this.documentStyle.getPropertyValue('--indigo-500'),
                            this.documentStyle.getPropertyValue('--purple-500'),
                            this.documentStyle.getPropertyValue('--teal-500')
                        ],
                        hoverBackgroundColor: [
                            this.documentStyle.getPropertyValue('--indigo-400'),
                            this.documentStyle.getPropertyValue('--purple-400'),
                            this.documentStyle.getPropertyValue('--teal-400')
                        ]
                    }
                ]
              };
            });

            //if they have tasks that were only completed late, compare it between months

          });

          
          //tasks supervised
          this.api.getEmployeeTasksSupervised(empIDNum).subscribe((res3) => {
            this.tasksSupervisedCount = res3.length;
          });
          //average date the employee finishes tasks
          this.api.getEmployeeAvgDateOfTaskCompletion(empIDNum).subscribe((res3) => {
            this.tasksAvgDateCompleted = res3;
            //average date all employees finish tasks
            this.api.getAvgDateOfTaskCompletion().subscribe((res4) => {
              this.tasksAvgDateCompletedForAll = res4;
            });
          });
        }
      });

      //number of tasks in progress - compare the number incomplete to the number they should be doing today
      this.api.getEmployeeTasksIncomplete(empIDNum).subscribe((res2) => {
        this.tasksIncompleteCount = res2.length;
        if (this.tasksIncompleteCount != 0)
        {
          //We have incomplete tasks so get how many are meant to be done, how many are past due date, how many due today

          this.api.getNumEmployeeTasksMeantToBeInProgress(empIDNum).subscribe((res3) => {
            this.tasksThatShouldBeInProgressCount = res3;

            this.api.getEmployeeTasksDueToday(empIDNum).subscribe((res4) => {
              this.tasksDueTodayCount = res4.length;

              this.api.getEmployeeTasksUpcoming(empIDNum).subscribe((res5) => {
                this.tasksUpcomingCount = res5.length;

                 //pie chart of the above?
                this.pieDataCurrent = {
                  labels: ['Past Due', 'Due today', 'In progress','Upcoming'],
                  datasets: [
                      {
                          data: [this.tasksIncompleteCount - this.tasksThatShouldBeInProgressCount - this.tasksUpcomingCount, this.tasksDueTodayCount, this.tasksThatShouldBeInProgressCount - this.tasksDueTodayCount,  this.tasksUpcomingCount],
                          backgroundColor: [
                              this.documentStyle.getPropertyValue('--indigo-500'),
                              this.documentStyle.getPropertyValue('--purple-500'),
                              this.documentStyle.getPropertyValue('--teal-500'),
                              this.documentStyle.getPropertyValue('--yellow-500')
                          ],
                          hoverBackgroundColor: [
                              this.documentStyle.getPropertyValue('--indigo-400'),
                              this.documentStyle.getPropertyValue('--purple-400'),
                              this.documentStyle.getPropertyValue('--teal-400'),
                              this.documentStyle.getPropertyValue('--yellow-400')
                          ]
                      }
                  ]
                };
                })
            })
          })

          this.api.getEmployeeTasksSupervising(empIDNum).subscribe((res3) => {
            this.tasksSupervisingCount = res3.length;
          })
        } 
      })
      
      this.api.getMostCommonComment(empIDNum).subscribe((res2) => {
        this.mostCommonComment = res2
      } )
      this.api.getMostCommonPositiveComment(empIDNum).subscribe((res2) => {
        this.mostCommonPositive = res2
      } )
      this.api.getMostCommonNegativeComment(empIDNum).subscribe((res2) => {
        this.mostCommonNegative = res2
      } )
      this.api.getAvgRatingPerMonth(empIDNum).subscribe((res2) => {
        this.avgRatingPerMonth = res2
        this.api.getAvgSentimentPerMonth(empIDNum).subscribe((res2) => {
          this.avgSentimentPerMonth = res2
          this.avgSentimentPerMonth.forEach((element, index, arr) => {
            //if sentiment is 0, none. If around 1, positive. any higher and negative
            //so 6.3 - element * 5/3 means:
            //if sentiment of 1, end up with 4.6. If neutral (2) end up with 3, if negative end up with 1.3
            if (element <= 0) //no sentiment
              arr[index] = 0;
            else 
              arr[index] = 6 - element*5/3.0
          })
          this.ratingsBarData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
              {
                label: 'Average Rating Per Month',
                backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                data: this.avgRatingPerMonth
              },
              {
                label: 'Average Sentiment Per Month',
                backgroundColor: documentStyle.getPropertyValue('--secondary-500'),
                borderColor: documentStyle.getPropertyValue('--secondary-500'),
                data: this.avgSentimentPerMonth
              }
            ]
          };
        } )
        
      } )
      

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border')


      this.ratingsBarOptions = {
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
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          },
        }
      };

    })
  }

  goBack() {
    this.router.navigate(['../../../employee-overview'], {
      relativeTo: this.activatedRoute,
    })
  }

  betterDate(dateStr: string) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleString('en-US', options);
  }


  onFilterChange(event: any, dv: DataView) {
    console.log(event.value)
    if (event.value == this.defaultOption)
    {
      dv.filter("");
      this.selectedActivity = null;
      this.selectedActivityAvgRating = 0;
    }
    else
    {
      dv.filter(event.value);
      //get the activity 
      let foundActivity = this.activities.find(act => act.act_Name==event.value)
      if (foundActivity == undefined) return;
      this.selectedActivity = foundActivity;
      console.log(this.selectedActivity.act_Name)
      //search for the avg rating for this activity
      this.api.getEmployeeAvgRatingForActivity(this.employee.emp_ID!, this.selectedActivity.act_ID).subscribe((res) => {
        this.selectedActivityAvgRating = res;
      });
    }
      
    /*if (event.value == this.categoryOptions.at(0)) {
      this.ifStock = true;
      this.sortOptions = [
        { label: 'High to Low', value: '!stock_Quantity' },
        { label: 'Low to High', value: 'stock_Quantity' }
      ];
    }
    else {
      this.ifStock = false;
      this.sortOptions = [
        { label: 'High to Low', value: '!eqp_Quantity_Total' },
        { label: 'Low to High', value: 'eqp_Quantity_Total' }
      ];
    }*/
  }

  onSortChange(event: any) {
    const value = event.value;

    if (value == this.sortOptions.at(0))
    {
      //sort by most recent
      this.sortOrder = -1;
      this.sortField = "rating_Date";
    }
    else if (value == this.sortOptions.at(1))
    {
      //sort by highest rating
      this.sortOrder = -1;
      this.sortField = "rating_Rating";
    }
    else
    {
      //sort by lowest rating
      this.sortOrder = 1;
      this.sortField = "rating_Rating";
    }
    console.log(this.sortOrder)
  }
  
}

