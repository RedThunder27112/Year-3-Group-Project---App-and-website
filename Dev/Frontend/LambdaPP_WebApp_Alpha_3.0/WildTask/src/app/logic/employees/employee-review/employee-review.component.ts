import { Component, numberAttribute } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService} from '../../api.service'
import Employee from '../../models/Employee';
import Rating from '../../models/Rating';
import { DataView } from 'primeng/dataview';
import Activity from '../../models/Activity';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-employee-review',
  templateUrl: './employee-review.component.html',
  styleUrls: ['./employee-review.component.scss']
})
export class EmployeeReviewComponent {

  rating!: Rating;
  SimilarRatings: Rating[] = [];
  MostSimilarRatings: Rating[] = [];
  SimilarRatingsCount: number = 0;
  employee: Employee|undefined;
  
  sortOrder: number = 0;
  sortField: string = 'rating_Date';
  activityOptions = ["All"];
  activities: Activity[] = [];
  defaultOption = this.activityOptions.at(0);

  selectedActivity: Activity|null = null;
  selectedActivityAvgRating: number = 0;

  suggestedCategory: number = 0;
  suggestedSeverity: string = "";

  showMoreSimilarReviews: boolean = false;
  changingCategory: boolean = false;

  starNumbers = Array(5).fill(1).map((x,i)=>i);

  sortOptions = ["Most Recent", "Highest Ratings", "Lowest Ratings"];

  breadcrumbItems: MenuItem[] = [];

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
    let reviewID = this.activatedRoute.snapshot.paramMap.get('id')
    if (reviewID == null) {
      this.goBack();
      return;

    }
    let reviewIDNum = parseInt(reviewID)
    if ((Number.isNaN(reviewIDNum))) {
      console.log("Not a number:", reviewID)
      this.goBack();
      return;
    }
    
    this.api.getRating(reviewIDNum).subscribe(res => {
      this.rating = res

      //get reviewer
      this.api.getEmployee(this.rating.reviewer_ID).subscribe((res2) => {
        this.rating.reviewer = res2;
        if (res2.emp_ID != null && this.rating.reviewer != null)
          this.api.getProfilePic(res2.emp_ID)
          .subscribe(url => {
            this.rating.reviewer!.emp_ID_Image = url;
          })
      })
      
      this.api.getTask(this.rating.task_ID).subscribe((res3) => {
        this.rating.task = res3;
      })

      //get reviewed employee
      this.api.getEmployee(this.rating.emp_ID).subscribe((res2) => {
        this.employee = res2;
        if (res2.emp_ID != null && this.employee != null)
          this.api.getProfilePic(res2.emp_ID)
          .subscribe(url => {
            this.employee!.emp_ID_Image = url;
          })

           // breadcrumbs
          this.breadcrumbItems = [];
          this.breadcrumbItems.push({ label: 'Employees', routerLink: '../../../' });
          this.breadcrumbItems.push({ label: 'Employee Details', routerLink: ['../../detail', this.employee!.emp_ID] });
          this.breadcrumbItems.push({ label: 'Employee Review', routerLink: ['../../review', reviewID] });
      })

      //get similar reviews
      this.api.getSimilarReviews(reviewIDNum).subscribe((res2) => {
        this.SimilarRatings = res2;
        this.SimilarRatingsCount = res2.length;
        let count: number = 0
        res2.forEach(element => {
          //for each rating, get the employee who posted it and the task it was associated with
          this.api.getEmployee(element.reviewer_ID).subscribe((res3) => {
            element.reviewer = res3;
          })
          this.api.getEmployee(element.emp_ID).subscribe((res3) => {
            element.employee = res3;
          })
          
          this.api.getTask(element.task_ID).subscribe((res3) => {
            element.task = res3;
            //add the activity to the list of activities to filter by, if it's not already there
            if (this.activityOptions.findIndex((act) => act == res3.activity.act_Name) == -1)
              this.activityOptions.push(res3.activity.act_Name)
              this.activities.push(res3.activity)
          })

          //save the first 4 ratings separately
          if (count < 5)
          {
            this.MostSimilarRatings.push(element);
            count++;
          }
        });
      })
    })
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
      /*this.api.getEmployeeAvgRatingForActivity(this.employee.emp_ID!, this.selectedActivity.act_ID).subscribe((res) => {
        this.selectedActivityAvgRating = res;
      });*/

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

  goBack() {
    this.router.navigate(['../../../employee/detail', this.employee!.emp_ID], {
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

  // rating categories
  getRatingCategory(ratingCat: number|null)
  {
    if(ratingCat == 1) return "POSITIVE"
    else if (ratingCat == 2) return "NEUTRAL"
    else if (ratingCat == 3) return "NEGATIVE"
    else return "UNDEFINED"
  }

  getSeverity(ratingCat: number|null) 
  {
    if(ratingCat == 1) return "success"
    else if (ratingCat == 2) return "info"
    else if (ratingCat == 3) return "danger"
    else return ""
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

  getSuggestedCategory(ratingID: number) 
  {
    if (this.suggestedCategory == 0)
      this.api.suggestReviewCategory(ratingID).subscribe(
        (res) => {
          this.suggestedCategory = res
          this.suggestedSeverity = this.getSeverity(this.suggestedCategory)
        }
      )
    return this.getRatingCategory(this.suggestedCategory)
  }

  saveSuggestion()
  {
    console.log("Saving suggested category of", this.suggestedCategory);
    this.saveCategory(this.suggestedCategory)
  }

  saveCategory(category: number)
  {
    this.api.saveCategory(this.rating.rating_ID,category).subscribe( () => {location.reload();} );
  }

  redirect(Rating_ID: number)
  {
    console.log(Rating_ID)
    location.replace(`${location.pathname.substring(0,location.pathname.lastIndexOf("/"))}/${Rating_ID}`,)
  }
}

