import { Component, Input } from '@angular/core';
import { MenuService } from 'src/app/layout/app.menu.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import Employee from '../../models/Employee';
import { APIService } from '../../api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  providers: [MessageService]
})
export class UserSettingsComponent {

  @Input() minimal: boolean = false;

  scales: number[] = [12, 13, 14, 15, 16];

  constructor(public layoutService: LayoutService, 
              public menuService: MenuService, 
              public api: APIService,
              public messageService: MessageService) { }

  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  get scale(): number {
    return this.layoutService.config.scale;
  }

  set scale(_val: number) {
    this.layoutService.config.scale = _val;
  }

  get menuMode(): string {
    return this.layoutService.config.menuMode;
  }

  set menuMode(_val: string) {
    this.layoutService.config.menuMode = _val;
  }

  get inputStyle(): string {
    return this.layoutService.config.inputStyle;
  }

  set inputStyle(_val: string) {
    this.layoutService.config.inputStyle = _val;
  }

  get ripple(): boolean {
    return this.layoutService.config.ripple;
  }

  set ripple(_val: boolean) {
    this.layoutService.config.ripple = _val;
  }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }

  changeTheme(theme: string, colorScheme: string) {
    const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, theme);
    this.layoutService.config.colorScheme
    this.replaceThemeLink(newHref, () => {
      this.layoutService.config.theme = theme;
      this.layoutService.config.colorScheme = colorScheme;
      this.layoutService.onConfigUpdate();
    });
  }

  replaceThemeLink(href: string, onComplete: Function) {
    const id = 'theme-css';
    const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');

    themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);

    cloneLinkElement.addEventListener('load', () => {
      themeLink.remove();
      cloneLinkElement.setAttribute('id', id);
      onComplete();
    });
  }

  decrementScale() {
    this.scale--;
    this.applyScale();
  }

  incrementScale() {
    this.scale++;
    this.applyScale();
  }

  applyScale() {
    document.documentElement.style.fontSize = this.scale + 'px';
  }

  password!: any;
  confirmPassword!: any;
  employee!: Employee;

  // my code
  changePassword()
  {
    if(this.password == this.confirmPassword && this.password != null)
    {
      this.employee = JSON.parse(sessionStorage.getItem('emp')!);

      let name = this.employee.emp_Name;
      let surname = this.employee.emp_Sur
      let email = this.employee.emp_Username;
      let password = this.password;
      
      let newEmployee = new Employee(name, surname, email, password, "Administrator")
      newEmployee.emp_ID = this.employee.emp_ID

      this.api.updateEmployee(newEmployee).subscribe((emp) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Password changed successfully", life: 2000 });
        sessionStorage.setItem("emp", JSON.stringify(emp))
        this.password = ""       
        this.confirmPassword = ""       
      });
    }
  }

}
