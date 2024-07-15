import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForm';
import Activity from 'src/app/models/Activity';
import { APIService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.scss']
})
export class CreateActivityComponent implements OnInit {

  createActForm!: FormGroup

  constructor(private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder,
              private api: APIService) {}

  ngOnInit(): void {
    this.createActForm = this.fb.group({
      name: ['', Validators.required],
      desc: ['', Validators.required]
    });
  }

  createActivity(formDirective: FormGroupDirective) {
    if(this.createActForm.valid)
    {
      let name = this.createActForm.get("name")?.value
      let desc = this.createActForm.get("desc")?.value

      let activity = new Activity(name, desc)
      
      this.api.createActivity(activity)
      .subscribe(res => {
        Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        }).fire({
          icon: 'success',
          title: 'Activity Created Successfully'
        })
      })
      
      formDirective.resetForm()
      this.createActForm.reset()
    }
    
    else
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.createActForm)
    }
  }

  goBack() {
    this.router.navigate(['../task-management'], {relativeTo: this.activatedRoute})
  }
}
