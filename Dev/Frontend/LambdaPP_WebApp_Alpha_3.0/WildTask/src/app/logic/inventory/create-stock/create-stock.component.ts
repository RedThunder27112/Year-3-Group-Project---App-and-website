import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { APIService } from '../../api.service';
import { MenuItem, MessageService } from 'primeng/api';
import { UploadEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-create-stock',
  templateUrl: './create-stock.component.html',
  styleUrls: ['./create-stock.component.scss'],
  providers: [MessageService]
})
export class CreateStockComponent {

  constructor(private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService) { }

  path!: string;
  resource!: string
  createStockForm!: FormGroup;
  NUMERIC_PATTREN = '^[1-9]\\d*$'

  breadcrumbItems: MenuItem[] = [];

  ngOnInit(): void {
    this.createStockForm = this.fb.group({
      name: ['', Validators.required],
      desc: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1), Validators.pattern(this.NUMERIC_PATTREN)]],
      category: ['', Validators.required]
    });

    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Inventory', routerLink: '../' });
    this.breadcrumbItems.push({ label: 'Add New Item', routerLink: ['../add-item']})  

    this.path = this.activatedRoute.routeConfig?.path!;

    if (this.path == 'add-stock') this.resource = "Stock"
    if (this.path == 'add-equipment') this.resource = "Equipment"
  }

  goBack() {
    if (this.path == 'add-stock') {
      this.router.navigate(['../stock-management'], { relativeTo: this.activatedRoute })
    }
    if (this.path == 'add-equipment') {
      this.router.navigate(['../equip-management'], { relativeTo: this.activatedRoute })
    }
  }

  uploadedFiles: any[] = [];
  maxi = 1000000;
  onUpload(event: UploadEvent) {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }

  addToInventory() {
    if (this.createStockForm.valid) {

      let category = this.createStockForm.get("category")?.value
      if (category == 'Stock') {
        this.createStock()
      }
      else if (category == 'Equipment') {
        this.createEquip()
      }

      this.createStockForm.reset()
    }
  }

  createStock() {
    this.api.createStock(this.createStockForm)
      .subscribe(res => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock Added Successfully' });
      })
  }

  createEquip() {
    this.api.createEquip(this.createStockForm)
      .subscribe(res => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Equipment Added Successfully' });
      })
  }
}
