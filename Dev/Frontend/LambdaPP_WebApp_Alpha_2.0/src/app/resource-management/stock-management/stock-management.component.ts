import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Equipment from 'src/app/models/Equipment';
import Stock from 'src/app/models/Stock';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-stock-management',
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.scss']
})
export class StockManagementComponent implements OnInit {

  constructor(private api: APIService,
              private router: Router, 
              private activatedRoute: ActivatedRoute) {}
              
  stock!: Stock[];
  equipment!: Equipment[];
  
  ngOnInit(): void {

    // equipment
    this.api.getAllEquipment()
    .subscribe(equip => {
      // adding images to stock
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
  }

  goToStock(stockID: number) {
    this.router.navigate(['../stock-detail', stockID], {relativeTo: this.activatedRoute})
  }

  // goToEquip(eqpID: number) {
  //   this.router.navigate(['../equip-detail', eqpID], {relativeTo: this.activatedRoute})
  // }

  goToCreateStock() {
    this.router.navigate(['../add-stock'], {relativeTo: this.activatedRoute})
  }
}
