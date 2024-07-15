import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    TableModule,
    MultiSelectModule,
    TagModule,
    DropdownModule,
    ButtonModule,
    CheckboxModule,
    FileUploadModule
  ]
})
export class NgPrimeModule { }
