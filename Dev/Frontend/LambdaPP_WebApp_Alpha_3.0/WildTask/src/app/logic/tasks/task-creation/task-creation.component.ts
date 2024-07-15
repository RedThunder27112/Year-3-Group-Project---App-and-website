import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APIService } from '../../api.service';
import { TaskCreationService } from './task-creation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-creation',
  templateUrl: './task-creation.component.html',
  styleUrls: ['./task-creation.component.scss'],
  providers: [MessageService]
})
export class TaskCreationComponent {

  items!: MenuItem[];
  subscription!: Subscription;

  private data!: any;

  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private share: TaskCreationService
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Details',
        routerLink: 'create-task'
      },
      {
        label: 'Confirmation',
        routerLink: 'task-confirmation'
      }
    ];
  }

  checkData() {
    this.share.currentData
      .subscribe(data => {
        this.data = data;
      })
  }

  goBack() {
    this.checkData() // check data first

    let path = parseInt(this.activatedRoute.snapshot.paramMap.get('id')!)

    if (this.data != "") {
      Swal.fire({
        icon: 'warning',
        title: 'Do you want to exit?',
        text: "You will lose all your task progress!",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Don't Exit",
        denyButtonText: `Exit Anyways`,
      }).then((result) => {
        if (result.isConfirmed) {
          // do nothing
        }
        else if (result.isDenied) {
          if(!Number.isNaN(path))
          {
            this.router.navigate(['../task-task-templates'], { relativeTo: this.activatedRoute })
          }
          else
          {
            this.router.navigate(['../task-setup'], { relativeTo: this.activatedRoute })
          }

          // delete the data
          this.share.data = new BehaviorSubject('');
          this.share.currentData = this.share.data.asObservable();
        }
      })
    }
    else {
      if(!Number.isNaN(path))
      {
        this.router.navigate(['../task-task-templates'], { relativeTo: this.activatedRoute })
      }
      else
      {
        this.router.navigate(['../task-setup'], { relativeTo: this.activatedRoute })
      }
    }
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
