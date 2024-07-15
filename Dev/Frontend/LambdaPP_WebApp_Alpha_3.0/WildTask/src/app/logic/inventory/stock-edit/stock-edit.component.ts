import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { UploadEvent } from 'primeng/fileupload';
import { APIService } from '../../api.service';
import Equipment from '../../models/Equipment';
import Stock from '../../models/Stock';

@Component({
  selector: 'app-stock-edit',
  templateUrl: './stock-edit.component.html',
  styleUrls: ['./stock-edit.component.scss'],
  providers: [MessageService]
})
export class StockEditComponent {

  constructor(private api: APIService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder,
              private messageService: MessageService) { }

  path!: string;
  resource!: string
  infoForm!: FormGroup;
  NUMERIC_PATTERN = '^[0-9]\\d*$'

  itemID!: number;

  isStock: boolean = true;
  myStock!: Stock
  myEquip!: Equipment

  breadcrumbItems: MenuItem[] = [];

  isReadonly: boolean = true

  myImage: any;
  myStockImage: any;
  myEquipImage: any;

  ngOnInit(): void {
    this.infoForm = this.fb.group({
      name: ['', Validators.required],
      desc: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0), Validators.pattern(this.NUMERIC_PATTERN)]],
      lead_Time: ['',[Validators.required, Validators.pattern(this.NUMERIC_PATTERN)]]
    });

    let choice = this.activatedRoute.routeConfig?.path!

    this.activatedRoute.params
    .subscribe(val=> {
        this.itemID = val['id']

        if(choice == "stock-edit/:id")
        {
          this.api.getStockByID(this.itemID)
          .subscribe(res => {
            
            // stock image
            this.api.getStockImage(this.itemID)
            .subscribe(url => {
              res.stock_Image = url;
              this.myImage = url;
            })

            this.breadcrumbItems = [];
            this.breadcrumbItems.push({ label: 'Inventory', routerLink: '../../' });
            this.breadcrumbItems.push({ label: 'Stock Detail', routerLink: ['../../stock-detail', this.itemID]})
            this.breadcrumbItems.push({ label: 'Edit Stock Item', routerLink: ['../', this.itemID]})

            this.myStock = res;
            this.isStock = true;
            this.fillStockForm(this.myStock)
          })
        }
        else if(choice == "equip-edit/:id")
        {
          this.api.getEquipByID(this.itemID)
          .subscribe(res => {
            
            // eqp image
            this.api.getEquipImage(this.itemID)
            .subscribe(url => {
              res.eqp_Image = url;
              this.myImage = url;
            })

            this.breadcrumbItems = [];
            this.breadcrumbItems.push({ label: 'Inventory', routerLink: '../../' });
            this.breadcrumbItems.push({ label: 'Equipment Detail', routerLink: ['../../equip-detail', this.itemID]})
            this.breadcrumbItems.push({ label: 'Edit Equipment Item', routerLink: ['../', this.itemID]})

            this.myEquip = res;
            this.isStock = false;
            this.fillEquipForm(this.myEquip)
          })
        }
    })



  }

  goBack() {
    if (this.path == 'add-stock') {
      this.router.navigate(['../stock-management'], { relativeTo: this.activatedRoute })
    }
    if (this.path == 'add-equipment') {
      this.router.navigate(['../equip-management'], { relativeTo: this.activatedRoute })
    }
  }

  fillStockForm(obj: Stock) {
    this.infoForm.setValue({
      name: obj.stock_Name,
      desc: obj.stock_Description,
      quantity: obj.stock_Quantity,
      lead_Time: obj.stock_Lead_Time
    })
  }

  fillEquipForm(obj: Equipment) {
    this.infoForm.setValue({
      name: obj.eqp_Name,
      desc: obj.eqp_Description,
      quantity: obj.eqp_Quantity_Total,
      lead_Time: 0
    })
  }

  uploadedFiles: any[] = [];
  maxi = 1000000;
  onUpload(event: UploadEvent) {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }

  updateInventory()
  {
    console.log(this.infoForm)
    if(this.infoForm.valid)
    {
      if (this.isStock)
      {
        this.api.updateStock(this.infoForm, this.itemID)
        .subscribe(res => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock Updated Successfully' });
        })
      }
      else
      {
        this.api.updateEquip(this.infoForm, this.itemID)
      .subscribe(res => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Equipment Updated Successfully' });
      })
      }
      
    }
  }

}
