import { Component, OnInit } from '@angular/core';
import { APIService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import Employee from '../../models/Employee';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-employee-checker',
  templateUrl: './employee-checker.component.html',
  styleUrls: ['./employee-checker.component.scss']
})
export class EmployeeCheckerComponent implements OnInit {

  employee1!: Employee
  employee2!: Employee

  employees!: Employee[]
  employeeSkills: any[] = []

  radar1Options: any;
  radar1Data: any;

  radar2Options: any;
  radar2Data: any;

  breadcrumbItems: MenuItem[] = [];

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.api.getAllEmployees()
    .subscribe(res => {

      this.breadcrumbItems = [];
      this.breadcrumbItems.push({ label: 'Employees', routerLink: '../' });
      this.breadcrumbItems.push({ label: 'Employee Checker', routerLink: ['../employee-checker'] });
      
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

      // getting each employees skills
      res.forEach(e => {
        this.api.getEmployeeSkills(e.emp_ID!)
        .subscribe(s => {
          let obj = {
            id: e.emp_ID,
            skills: s
          }

          console.log(s)
          this.employeeSkills.push(obj)
        })
      })

      this.employees = res;
    })
  }

  getEmpOne() {
    let skills: string[] = []
    let levels: number[] = []

    this.api.getEmployeeSkills(this.employee1.emp_ID!).subscribe((res2) => {

      res2.forEach((s: any) => {
        skills.push(s.skill.skill_Name)
        levels.push(s.level)
      })

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.radar1Data = {
        labels: skills,
        datasets: [
          {
            label: this.employee1.emp_Name + "'s " + "Skill Breakdown",
            borderColor: documentStyle.getPropertyValue('--indigo-400'),
            pointBackgroundColor: documentStyle.getPropertyValue('--indigo-400'),
            pointBorderColor: documentStyle.getPropertyValue('--indigo-400'),
            pointHoverBackgroundColor: textColor,
            pointHoverBorderColor: documentStyle.getPropertyValue('--indigo-400'),
            data: levels
          }
        ]
      };

      this.radar1Options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              fontColor: textColor
            }
          }
        },
        scales: {
          r: {
            grid: {
              color: textColorSecondary,
              circular: true,
            },
            ticks: {
              stepSize: 1, // the number of step
            },
            min: 0,
            max: 5,
            beginAtZero: true
          }
        }
      };
    });
  }

  getEmpTwo()
  {
    let skills: string[] = []
    let levels: number[] = []

    this.api.getEmployeeSkills(this.employee2.emp_ID!).subscribe((res2) => {
      res2.forEach((s: any) => {
        skills.push(s.skill.skill_Name)
        levels.push(s.level)
      })      

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.radar2Data = {
        labels: skills,
        datasets: [
          {
            label: this.employee2.emp_Name + "'s " + "Skill Breakdown",
            borderColor: documentStyle.getPropertyValue('--red-400'),
            pointBackgroundColor: documentStyle.getPropertyValue('--red-400'),
            pointBorderColor: documentStyle.getPropertyValue('--red-400'),
            pointHoverBackgroundColor: textColor,
            pointHoverBorderColor: documentStyle.getPropertyValue('--red-400'),
            data: levels
          }
        ]
      };
      
      this.radar2Options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              fontColor: textColor
            }
          }
        },
        scales: {
          r: {
            grid: {
              color: textColorSecondary,
              circular: true,
            },
            ticks: {
              stepSize: 1, // the number of step
            },
            min: 0,
            max: 5,
            beginAtZero: true
          }        
        }
      };
    });
  }
}
