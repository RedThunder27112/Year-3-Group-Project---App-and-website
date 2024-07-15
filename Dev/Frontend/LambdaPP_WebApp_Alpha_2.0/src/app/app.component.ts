import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import Employee from './models/Employee';
import { APIService } from './services/api.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'WildTask';

  showHeader: boolean = true;
  employee!: Employee
  empID!: number;

  profilePic!: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private es: APIService,
              private auth: AuthService)
  {

  }
}
