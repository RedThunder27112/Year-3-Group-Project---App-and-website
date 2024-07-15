import { Component, OnInit } from '@angular/core';
import { APIService } from '../../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';

@Component({
  selector: 'app-skills-overview',
  templateUrl: './skills-overview.component.html',
  styleUrls: ['./skills-overview.component.scss'],
})
export class SkillsOverviewComponent implements OnInit {
  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  skills!: any[];
  employees!: any[];

  radarData: any;
  radarOptions: any;

  sortOptions: SelectItem[] = [];
  sortOrder: number = 0;
  sortField: string = '';

  skillNames: string[] = [];
  skillNums: number[] = [];

  onFilter(dv: DataView, event: Event) {
    dv.filter((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.api.getSkillsWithEmployeeCount().subscribe((res) => {
      this.skills = res;
    });
  }
}
