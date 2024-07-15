import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import Employee from 'src/app/models/Employee';
import { APIService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import * as lodash from 'lodash';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit {

  public dataSource!: MatTableDataSource<Employee>;
 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  employees: Employee[] = [];
  displayedColumns: string[] = ['Image', 'Name', 'Username', 'IsAdmin', 'dateReg', 'Action']

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void 
  {
    this.api.getAllEmployees()
    .subscribe(res => {
      
      // adding a role
      res.forEach(e => {
        if(e.emp_IsAdmin) { e.emp_Role = "Administrator" }
        else if(e.emp_IsContractor) { e.emp_Role = "Contractor" }
        else { e.emp_Role = "Employee" }
      })

      // adding an image
      res.forEach(e => {
        this.api.getProfilePic(e.emp_ID!)
        .subscribe(url => {
          e.emp_ID_Image = url;
        })
      })

      this.employees = res;

      this.dataSource = new MatTableDataSource(this.employees);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })

    // console.log(this.employees)
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

  onFilter($event: any) {
    let filteredData = lodash.filter(this.employees, (item : Employee) => {
      return item.emp_Role == $event.value
    })

    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
  }

  reset() {
    this.dataSource = new MatTableDataSource(this.employees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  betterDate(dateStr: string)
  {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString();
    return formattedDate;
  }

  goToCreateEmployee() {
    this.router.navigate(['../add-employee'], {relativeTo: this.activatedRoute})
  }

  goToEmployeeDetail(row: Employee) {
    this.router.navigate(['../employee-detail', row.emp_ID], {relativeTo: this.activatedRoute})
  }
}
