import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Equipment from 'src/app/models/Equipment';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-equip-management',
  templateUrl: './equip-management.component.html',
  styleUrls: ['./equip-management.component.scss'],
})
export class EquipManagementComponent implements OnInit {
  constructor(
    private api: APIService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  equipment!: Equipment[];

  ngOnInit(): void {
    // equipment
    this.api.getAllEquipment().subscribe((equip) => {
      // adding images to stock
      equip.forEach((e: Equipment) => {
        this.api.getEquipImage(e.eqp_ID).subscribe((url) => {
          e.eqp_Image = url;
        });
      });

      this.equipment = equip;
    });
  }

  goToCreateEquip() {
    this.router.navigate(['../add-equipment'], {
      relativeTo: this.activatedRoute,
    });
  }

  goToEquip(eqpID: number) {
    this.router.navigate(['../equip-detail', eqpID], {
      relativeTo: this.activatedRoute,
    });
  }
}
