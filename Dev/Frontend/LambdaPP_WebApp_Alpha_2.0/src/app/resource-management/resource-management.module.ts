import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockComponent } from './stock/stock.component';
import { CreateStockComponent } from './create-stock/create-stock.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { StockManagementComponent } from './stock-management/stock-management.component';
import { ResourceRoutingModule } from './resource-routing.module';
import { NgMatModule } from '../modules/ng-mat/ng-mat.module';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { EquipManagementComponent } from './equip-management/equip-management.component';
import { NgPrimeModule } from '../modules/ng-prime/ng-prime.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    CreateStockComponent,
    StockDetailComponent,
    StockManagementComponent,
    StockComponent,
    EquipManagementComponent
  ],
  imports: [
    CommonModule,
    ResourceRoutingModule,
    NgMatModule,
    ReactiveFormsModule, // needed for formgroups
    HttpClientModule, // api calling
    FlexLayoutModule,
    SweetAlert2Module.forRoot(),
    ToastrModule.forRoot(),
    NgPrimeModule
  ]
})
export class ResourceManagementModule { }
