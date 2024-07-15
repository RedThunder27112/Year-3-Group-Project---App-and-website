import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { APIService } from '../logic/api.service';
import Employee from '../logic/models/Employee';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService, private api: APIService, private router: Router) { }

	employee!: Employee
	empID!: number;

    menuItems: MenuItem[] = [];

    badgeVal!: string
    badgeValInt!: number

    interval!: any

	ngOnInit(): void 
	{
        this.interval = setInterval(() => {
            this.api.getUnresolvedRequests()
            .subscribe(res => {
                this.badgeVal = res.length.toString()
                this.badgeValInt = res.length
            })
        }, 2000);

		if (sessionStorage.getItem("emp") != null) {
            this.employee = JSON.parse(sessionStorage.getItem("emp")!);
            this.empID = this.employee.emp_ID!;
		}

		this.getEmployeeImage();        

        this.menuItems = [
            {
                label: 'Settings',
                icon: 'pi pi-fw pi-cog',
                routerLink: ['settings'], routerLinkActiveOptions: { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' },
                command: () => {
                    
                }
            },
            {
                label: 'Profile', icon: 'pi pi-fw pi-user',
                routerLink: ['profile'], routerLinkActiveOptions: { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }
            },
            {
                separator: true
            },
            {
                label: 'Log Out', icon: 'pi pi-fw pi-sign-out',
                command: () => {
                    this.clearSession();
                }
            },
        ];
	}

    ngOnDestroy() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

	clearSession() {
		sessionStorage.clear()
        this.router.navigate(["login"])
	}
	
	getEmployeeImage() {
		this.api.getProfilePic(this.empID)
		.subscribe(url => {
			this.employee.emp_ID_Image = url;
		})
	}
}
