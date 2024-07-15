import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../api.service';
import { MenuItem, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-templates',
  templateUrl: './task-templates.component.html',
  styleUrls: ['./task-templates.component.scss']
})
export class TaskTemplatesComponent implements OnInit {

  taskTemplates!: any[]
  sortOptions: SelectItem[] = [];
  sortOrder: number = 0;
  sortField: string = '';

  isEdit: Boolean = false;

  breadcrumbItems: MenuItem[] = [];
  menuItems!: MenuItem[];

  constructor(private api: APIService, 
              private router: Router,
              private fb: FormBuilder, 
              private activatedRoute: ActivatedRoute) { }

  ngOnInit()
  {
    this.activatedRoute.params
    .subscribe(val=> {
      let Edit = val['edit'];
      
      this.api.getTaskTemplates()
      .subscribe(res => {
        this.taskTemplates = res;
      })
      this.breadcrumbItems = [];
     
      

      if (Edit!=undefined)
      {
        this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../../' });
        this.breadcrumbItems.push({ label: 'Task Setup', routerLink: ['../../task-setup'] });
        this.breadcrumbItems.push({ label: 'Task Templates', routerLink: ['../../task-templates'] });
        this.breadcrumbItems.push({ label: 'Edit', routerLink: ['../edit'] });
        this.isEdit = true;
      }
      else
      {
        this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../' });
        this.breadcrumbItems.push({ label: 'Task Setup', routerLink: ['../task-setup'] });
        this.breadcrumbItems.push({ label: 'Task Templates', routerLink: ['../task-templates'] });
      }

    })

    

    

    this.menuItems = [
      {
          label: 'Update', icon: 'pi pi-fw pi-refresh'
      },
      {
          label: 'Delete', icon: 'pi pi-fw pi-trash'
      }
    ];
  }

  onFilter(dv: DataView, event: Event) {
    dv.filter((event.target as HTMLInputElement).value);
  }

  goBack()
  {
    if (this.isEdit)
      this.router.navigate(['../../task-templates'], { relativeTo: this.activatedRoute })
    else
      this.router.navigate(['../task-setup'], { relativeTo: this.activatedRoute })
  }

  redirectToPage(taskTemplateID: number)
  {
    //[routerLink]="['../task-steps/create-task', t.template_ID]"
    if (this.isEdit)
      this.router.navigate([`../../task-edit/${taskTemplateID}/template`], { relativeTo: this.activatedRoute })
    else
      this.router.navigate([`../task-steps/create-task/${taskTemplateID}`], { relativeTo: this.activatedRoute })

  }
}
