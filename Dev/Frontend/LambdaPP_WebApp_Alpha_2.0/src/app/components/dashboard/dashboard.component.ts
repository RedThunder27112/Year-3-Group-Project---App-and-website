import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Employee from 'src/app/models/Employee';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  empID!: number;
  employee!: Employee

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private api: APIService) {}

  ngOnInit(): void {
    
  }
}
