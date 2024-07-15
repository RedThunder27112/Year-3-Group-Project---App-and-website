import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateStockComponent } from './create-stock/create-stock.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { StockManagementComponent } from './stock-management/stock-management.component';
import { EquipManagementComponent } from './equip-management/equip-management.component';

const routes: Routes = [
  {
    path: 'stock-management',
    title: 'WildTask',
    component: StockManagementComponent,
  },
  {
    path: 'equip-management',
    title: 'WildTask',
    component: EquipManagementComponent,
  },
  {
    path: 'add-stock',
    title: 'WildTask',
    component: CreateStockComponent,
  },
  {
    path: 'add-equipment',
    title: 'WildTask',
    component: CreateStockComponent,
  },
  {
    path: 'stock-detail/:stockID',
    title: 'WildTask',
    component: StockDetailComponent,
  },
  {
    path: 'equip-detail/:stockID',
    title: 'WildTask',
    component: StockDetailComponent,
  },
  { path: '', redirectTo: 'stock-management', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourceRoutingModule {}
