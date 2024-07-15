import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../api.service';
import Equipment from '../../models/Equipment';
import Stock from '../../models/Stock';
import { SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';

@Component({
  selector: 'app-stock-management',
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.scss']
})
export class StockManagementComponent implements OnInit {

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute) { }

  stock!: Stock[];
  equipment!: Equipment[];

  ifStock = true;

  categoryOptions = ["Stock", "Equipment"];
  defaultOption = this.categoryOptions.at(0);
  
  // sortOptions = ["Quantity - High to Low", "Quantity - Low to High"];
  sortOptions: SelectItem[] = [];
  sortOrder: number = 0;
  sortField: string = '';
  
  // prime
  onSortChange(event: any) {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  onMainSortChange(event: any) {
    if (event.value == this.categoryOptions.at(0)) {
      this.ifStock = true;
      this.sortOptions = [
        { label: 'High to Low', value: '!stock_Quantity' },
        { label: 'Low to High', value: 'stock_Quantity' }
      ];
    }
    else {
      this.ifStock = false;
      this.sortOptions = [
        { label: 'High to Low', value: '!eqp_Quantity_Total' },
        { label: 'Low to High', value: 'eqp_Quantity_Total' }
      ];
    }
  }

  onFilter(dv: DataView, event: Event) {
    dv.filter((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {

    // equipment
    this.api.getAllEquipment()
      .subscribe(equip => {
        // adding images to equipment
        equip.forEach((e: Equipment) => {
          this.api.getEquipImage(e.eqp_ID)
            .subscribe(url => {
              e.eqp_Image = url;
            })
        });

        this.equipment = equip;
      })

    // stock
    this.api.getAllStock()
      .subscribe(stock => {

        // adding images to stock
        stock.forEach((e: Stock) => {
          this.api.getStockImage(e.stock_ID)
            .subscribe(url => {
              e.stock_Image = url;
            })
        });

        this.stock = stock;
      })

    // filter
    this.sortOptions = [
      { label: 'High to Low', value: '!stock_Quantity' },
      { label: 'Low to High', value: 'stock_Quantity' }
    ];
  }

  goToStock(stockID: number) {
    this.router.navigate(['../stock-detail', stockID], { relativeTo: this.activatedRoute })
  }

  // goToEquip(eqpID: number) {
  //   this.router.navigate(['../equip-detail', eqpID], {relativeTo: this.activatedRoute})
  // }

  goToCreateStock() {
    this.router.navigate(['../add-stock'], { relativeTo: this.activatedRoute })
  }
}
