import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  showNotification = false;
  showProfile = false;

  showNotificationDropdown() {
    this.showNotification = !this.showNotification;
  }
  showProfileDropdown() {
    this.showProfile = !this.showProfile;
  }
}
