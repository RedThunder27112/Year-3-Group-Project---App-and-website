import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { StockManagementComponent } from './stock-management/stock-management.component';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { NgPrimeModule } from 'src/app/ng-prime.module';
import { CreateStockComponent } from './create-stock/create-stock.component';
import { StockDetailsComponent } from './stock-details/stock-details.component';
import { StockEditComponent } from './stock-edit/stock-edit.component';

@NgModule({
  declarations: [
    StockManagementComponent,
    InventoryManagementComponent,
    CreateStockComponent,
    StockDetailsComponent,
    StockEditComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    NgPrimeModule
  ]
})
export class InventoryModule { }
