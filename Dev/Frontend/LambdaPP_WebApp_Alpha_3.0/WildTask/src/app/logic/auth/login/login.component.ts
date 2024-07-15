import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APIService } from '../../api.service';
import Employee from '../../models/Employee';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  valCheck: string[] = ['remember'];

  password!: string;
  isLoading = false;

  spinnerSize = 100;

  loginForm!: FormGroup;
  employee!: Employee;

  // prime
  visible: boolean = false;

  showDialog() {
      this.visible = true;
  }

  constructor(private fb: FormBuilder, private api: APIService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required], // not checking for actual email currently
      password: ['', Validators.required]
    })
  }

  registerMessage() {
    let message = "If you're a recent hire or a contractor and would like access to the system, please contact a WildTask administrator.";
    Swal.fire("Contact Admin", message, "info");
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.api.login(this.loginForm).subscribe(
        {
          next: (res: any) => {
            if (res != null) {
              this.employee = res;

              if (res.emp_IsAdmin) {
                this.router.navigate(['main'])
                this.loginForm.reset()

                // stores employee in browser session
                sessionStorage.setItem('emp', JSON.stringify(res));
              }
              else if (!res.emp_IsAdmin) {
                Swal.fire("Not an Admin", "Please use the app as this site is admin only.", "info");
                this.isLoading = false;
              }
            }
            else {
              Swal.fire("Login Error!", "Incorrect email or password, please try again.", "error");
              this.isLoading = false;
            }
          },
          error: (error) => {
            // Handle the error returned from the API service
            Swal.fire("Server Error!", "An unexpected error has occured.", "error");
            this.isLoading = false;
          }
        })
    }
    else {
      console.log("ERR!!!")
      this.isLoading = false;
    }
  }
}
