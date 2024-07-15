import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { StockManagementComponent } from './stock-management/stock-management.component';
import { CreateStockComponent } from './create-stock/create-stock.component';
import { StockDetailsComponent } from './stock-details/stock-details.component';
import { StockEditComponent } from './stock-edit/stock-edit.component';

const routes: Routes = [
  {
    path: '', component: InventoryManagementComponent, children: [
      { path: '', component: StockManagementComponent },
      { path: 'add-item', component: CreateStockComponent },
      { path: 'stock-detail/:id', component: StockDetailsComponent },
      { path: 'equip-detail/:id', component: StockDetailsComponent },
      { path: 'stock-edit/:id', component: StockEditComponent },
      { path: 'equip-edit/:id', component: StockEditComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
