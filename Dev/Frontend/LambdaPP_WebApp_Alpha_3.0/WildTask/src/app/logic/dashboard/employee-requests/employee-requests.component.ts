import { Component, OnInit } from '@angular/core';
import { APIService } from '../../api.service';
import Request from '../../models/Request';
import Employee from '../../models/Employee';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-requests',
  templateUrl: './employee-requests.component.html',
  styleUrls: ['./employee-requests.component.scss'],
  providers: [MessageService]
})
export class EmployeeRequestsComponent implements OnInit {

  employeeRequests: any[] = []
  skillsRequests: any[] = []

  constructor(private api: APIService, private messageService: MessageService, private router: Router) { }

  ngOnInit() {
    this.api.getUnresolvedRequests()
      .subscribe(res => {
        res.forEach(req => {
          this.api.getEmployee(req.emp_ID)
            .subscribe(emp => {
              this.api.getProfilePic(emp.emp_ID!)
                .subscribe(url => {
                  emp.emp_ID_Image = url;
                  req.employee = emp;
                })
            })
        })
        
        this.employeeRequests = res.reverse();
      })

    this.api.getAllUnsolvedSkillRequests()
      .subscribe(res2 => {
        res2.forEach((req2: any) => {
          this.api.getEmployee(req2.emp_ID)
            .subscribe(emp => {
              this.api.getProfilePic(emp.emp_ID!)
                .subscribe(url => {
                  emp.emp_ID_Image = url;
                  req2.employee = emp;

                  this.api.getSkill(req2.skill_ID)
                  .subscribe(sk => {
                    req2.skill = sk
                  })
                })
            })

          this.skillsRequests.push(req2)
        })
      })
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
    });
  }

  resolveSkillRequest(req: any, resolve: number) {
    this.api.resolveSkillRequest(req, resolve)
      .subscribe(res => {
        if (resolve == 1) {
          this.messageService.add({ severity: 'success', summary: 'Skill Request Approved', detail: 'Request has been approved' });
          setTimeout((res: any) => {
            this.reloadCurrentRoute()
          }, 2000)
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'SKill Request Denied', detail: 'Request has been denied' });
          setTimeout((res: any) => {
            this.reloadCurrentRoute();
          }, 2000)
        }
      })
  }

  accept(req: Request) {
    this.api.approveRequest(req.req_ID)
      .subscribe(res => {
        this.messageService.add({ severity: 'success', summary: 'Request Approved', detail: 'Request has been approved' });
        setTimeout((res: any) => {
          this.ngOnInit();
        }, 2000)
      })
  }

  decline(req: Request) {
    this.api.approveRequest(req.req_ID)
      .subscribe(res => {
        this.messageService.add({ severity: 'error', summary: 'Request Denied', detail: 'Request has been denied' });
        setTimeout((res: any) => {
          this.ngOnInit();
        }, 2000)
      })
  }
}
