import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AutoCompleteModule } from "primeng/autocomplete";
import { CalendarModule } from "primeng/calendar";
import { ChipsModule } from "primeng/chips";
import { DropdownModule } from "primeng/dropdown";
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { MultiSelectModule } from "primeng/multiselect";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputTextModule } from "primeng/inputtext";
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DataViewModule } from 'primeng/dataview';
import { RatingModule } from 'primeng/rating';
import { FileUploadModule } from 'primeng/fileupload';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuModule } from 'primeng/menu';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { CarouselModule } from 'primeng/carousel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ChartModule } from 'primeng/chart';
import { TabMenuModule } from 'primeng/tabmenu';
import { StepsModule } from 'primeng/steps';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AccordionModule } from 'primeng/accordion';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';

import { GoogleMapsModule } from '@angular/google-maps'
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    AutoCompleteModule,
		CalendarModule,
		ChipsModule,
		DropdownModule,
		InputMaskModule,
		InputNumberModule,
		CascadeSelectModule,
		MultiSelectModule,
		InputTextareaModule,
		InputTextModule,
    BreadcrumbModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressBarModule,
		BadgeModule,
		AvatarModule,
		ScrollPanelModule,
		TagModule,
		ChipModule,
		ButtonModule,
		SkeletonModule,
		AvatarGroupModule,
    DataViewModule,
    RatingModule,
    FileUploadModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RadioButtonModule,
    DialogModule,
    PasswordModule,
    ProgressSpinnerModule,
    MenuModule,
    DynamicDialogModule,
    ImageModule,
    GalleriaModule, 
    CarouselModule,
    ScrollTopModule,
    ChartModule,
    TabMenuModule,
    StepsModule,
    SidebarModule,
    InputSwitchModule,
    AccordionModule,
    OverlayPanelModule,
    ContextMenuModule,
    MenubarModule,
    CardModule,
    
    GoogleMapsModule,
    PdfViewerModule
  ]
})
export class NgPrimeModule { }
