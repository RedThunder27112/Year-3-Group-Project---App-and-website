import { Component, OnInit} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss']
})
export class StockDetailComponent implements OnInit {

  stockID!: number

  constructor(private api: APIService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute,
              private fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      val=> {
        this.stockID = val['stockID']

      }
    )
  }

  goBack() {
    if(this.activatedRoute.routeConfig?.path! == 'stock-detail/:stockID')
    {
      this.router.navigate(['../../stock-management'], {relativeTo: this.activatedRoute})
    }
    if(this.activatedRoute.routeConfig?.path! == 'equip-detail/:stockID')
    {
      this.router.navigate(['../../equip-management'], {relativeTo: this.activatedRoute})
    }
  }
}
