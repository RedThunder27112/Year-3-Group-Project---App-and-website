import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForm';
import { APIService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-create-stock',
  templateUrl: './create-stock.component.html',
  styleUrls: ['./create-stock.component.scss']
})
export class CreateStockComponent implements OnInit {
  

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder) {}

  onUpload(event: UploadEvent) {
    console.log('Yay!')
  }

  path!: string;
  resource!: string
  createStockForm!: FormGroup;
  NUMERIC_PATTREN = '^[1-9]\\d*$'
  
  ngOnInit(): void {
    this.createStockForm = this.fb.group({
      name: ['', Validators.required],
      desc: ['', Validators.required],
      quantity:['', [Validators.required, Validators.min(1), Validators.pattern(this.NUMERIC_PATTREN)]]
    });

    this.path = this.activatedRoute.routeConfig?.path!;
    
    if(this.path == 'add-stock') this.resource = "Stock"
    if(this.path == 'add-equipment') this.resource = "Equipment"
  }

  goBack() {
    if(this.path == 'add-stock')
    {
      this.router.navigate(['../stock-management'], {relativeTo: this.activatedRoute})
    }
    if(this.path == 'add-equipment')
    {
      this.router.navigate(['../equip-management'], {relativeTo: this.activatedRoute})
    }
  }

  addToInventory(formDirective: FormGroupDirective) {

    if(this.createStockForm.valid)
    {
      if(this.path == 'add-stock')
      {
        this.createStock()
      }

      if(this.path == 'add-equipment')
      {
        this.createEquip()
      }

      formDirective.resetForm()
      this.createStockForm.reset()
    }
    else
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.createStockForm)
    }
  }

  createStock() {
    this.api.createStock(this.createStockForm)
    .subscribe(res => {
      Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      }).fire({
        icon: 'success',
        title: 'Stock Added Successfully'
      })
    })
  }

  createEquip() {
    this.api.createEquip(this.createStockForm)
    .subscribe(res => {
      Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      }).fire({
        icon: 'success',
        title: 'Eqipment Added Successfully'
      })
    })
  }
}
