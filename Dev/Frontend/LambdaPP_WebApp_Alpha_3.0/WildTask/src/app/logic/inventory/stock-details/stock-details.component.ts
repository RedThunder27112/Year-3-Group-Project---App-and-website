import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { UploadEvent } from 'primeng/fileupload';
import { APIService } from '../../api.service';
import Equipment from '../../models/Equipment';
import Stock from '../../models/Stock';

@Component({
  selector: 'app-stock-details',
  templateUrl: './stock-details.component.html',
  styleUrls: ['./stock-details.component.scss'],
  providers: [MessageService]
})
export class StockDetailsComponent {


  ceil(arg0: number) {
  return Math.ceil(arg0)
  }

  constructor(private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService) { }

  path!: string;
  resource!: string
  infoForm!: FormGroup;
  NUMERIC_PATTREN = '^[1-9]\\d*$'
  breadcrumbItems: MenuItem[] = [];

  itemID!: number;
  stockAmountAvailable: number = 0;
  stockUsedPerMonth: number[] = [];
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
  monthCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  isStock: boolean = true;
  myStock!: Stock
  myEquip!: Equipment

  isReadonly: boolean = true

  myImage: any;
  myStockImage: any;
  myEquipImage: any;


  stockBarData: any;
  stockBarOptions: any;

  ngOnInit(): void {
    this.infoForm = this.fb.group({
      name: ['', Validators.required],
      desc: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1), Validators.pattern(this.NUMERIC_PATTREN)]],
    });

    let choice = this.activatedRoute.routeConfig?.path!

    this.activatedRoute.params
      .subscribe(val => {
        let itemID: number = val['id']

        if (choice == "stock-detail/:id") {
          this.api.getStockByID(itemID)
            .subscribe(res => {

              // stock image
              this.api.getStockImage(itemID)
                .subscribe(url => {
                  res.stock_Image = url;
                  this.myImage = url;
                })

              this.isStock = true;
              this.myStock = res;
              
              this.breadcrumbItems = [];
              this.breadcrumbItems.push({ label: 'Inventory', routerLink: '../../' });
              this.breadcrumbItems.push({ label: 'Stock Detail', routerLink: ['../', itemID]})


              this.fillStockForm(this.myStock)

              this.api.getLowStock(itemID)
                .subscribe(res => {
                  this.myStock.Low_Stock = res;
                  console.log("stock", this.myStock);
                })

            })
          this.api.getStockQuantityAvailable(itemID)
            .subscribe(res => {
              this.stockAmountAvailable = res
            })
          this.api.getStockUsedPerMonth(itemID)
            .subscribe(res => {
              this.stockUsedPerMonth = res
              this.stockBarData = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                datasets: [
                  {
                    label: 'Stock Used Per Month',
                    backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: this.stockUsedPerMonth
                  }
                ]
              };
            })

          const documentStyle = getComputedStyle(document.documentElement);
          const textColor = documentStyle.getPropertyValue('--text-color');
          const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
          const surfaceBorder = documentStyle.getPropertyValue('--surface-border')


          this.stockBarOptions = {
            scales: {
              x: {
                ticks: {
                  color: textColorSecondary,
                  font: {
                    weight: 500
                  }
                },
                grid: {
                  display: false,
                  drawBorder: false
                }
              },
              y: {
                ticks: {
                  color: textColorSecondary
                },
                grid: {
                  color: surfaceBorder,
                  drawBorder: false
                }
              },
            }
          };



        }
        else if (choice == "equip-detail/:id") {
          this.api.getEquipByID(itemID)
            .subscribe(res => {

              // stock image
              this.api.getEquipImage(itemID)
                .subscribe(url => {
                  res.eqp_Image = url;
                  this.myImage = url;
                })

              this.breadcrumbItems = [];
              this.breadcrumbItems.push({ label: 'Inventory', routerLink: '../../' });
              this.breadcrumbItems.push({ label: 'Equipment Detail', routerLink: ['../', itemID]})

              this.isStock = false;
              this.myEquip = res;
              console.log("equipment", this.myEquip);
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
      quantity: obj.stock_Quantity
    })
  }

  fillEquipForm(obj: Equipment) {
    this.infoForm.setValue({
      name: obj.eqp_Name,
      desc: obj.eqp_Description,
      quantity: obj.eqp_Quantity_Total
    })
  }

  uploadedFiles: any[] = [];
  maxi = 1000000;
  onUpload(event: UploadEvent) {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }

}
