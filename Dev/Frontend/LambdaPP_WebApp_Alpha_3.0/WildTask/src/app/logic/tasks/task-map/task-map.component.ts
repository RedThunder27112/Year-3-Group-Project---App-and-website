import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { APIService } from '../../api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-task-map',
  templateUrl: './task-map.component.html',
  styleUrls: ['./task-map.component.scss'],
  providers: [MessageService]
})
export class TaskMapComponent {

  breadcrumbItems: MenuItem[] = [];

  // ngModels
  locationName!: string
  lat!: number
  long!: number

  constructor(private api: APIService, private router: Router, private activatedRoute: ActivatedRoute, private messageService: MessageService) {}

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Tasks', routerLink: '../' });
    this.breadcrumbItems.push({ label: 'Task Sites', routerLink: ['../task-sites'] });
    this.breadcrumbItems.push({ label: 'Task Map', routerLink: ['../task-map'] });
  }

  createLocation()
  {
    let myLocation = {
      "loc_Name": this.locationName,
      "loc_Coordinates": "POINT(" + this.lat + " " + this.long + ")",
      "loc_Enabled": true,
    }

    this.api.saveLocation(myLocation)
    .subscribe(res => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: "Location added successfully"});
      console.log(res)
    })
  }

  // google maps

  mapOptions: google.maps.MapOptions = {
    center: { lat: -24.729888700200863, lng: 26.27757418149223 },
    zoom : 11,
    zoomControl: true,
    mapTypeControl: false, 
    streetViewControl: false,
    fullscreenControl: true
 }

  center: google.maps.LatLngLiteral = {
    lat: -24.729888700200863,
    lng: 26.27757418149223
  };

  markers = [] as any;
  zoom = 11;
  display: any;

  marker = {
    position: { lat: -24.729888700200863, lng: 26.27757418149223 },
    info: "Melorane Game Reserve!"
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  eventHandler(event: any, name: string) {
    console.log(event, name);

    // Add marker on double click event
    if (name === 'mapClick') {
      this.dropMarker(event)
    }
  }

  dropMarker(event: any) {

    this.lat = event.latLng.lat();
    this.long = event.latLng.lng();

    this.markers = []
    this.markers.push({
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      label: {
        color: 'blue',
        text: 'Marker label ' + (this.markers.length + 1),
      },
      title: 'Marker title ' + (this.markers.length + 1),
      info: 'Marker info ' + (this.markers.length + 1),
      options: {
        animation: google.maps.Animation.DROP,
      },
    })
  }
  // --

}
