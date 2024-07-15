import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import ValidateForm from 'src/app/helpers/validateForm';
import Swal from 'sweetalert2';
import Employee from 'src/app/models/Employee';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hide = true; // for password
  isLoading = false

  // use lower-case for variables
  loginform!: FormGroup;
  employee!: Employee;

  constructor(private fb: FormBuilder, 
    private auth: AuthService,
    private es: APIService, 
    private router: Router) { }

  ngOnInit(): void {
    this.loginform = this.fb.group({

      email: ['', Validators.required], // not checking for actual email currently
      password: ['', Validators.required]
    })
  }

  onLogin() {
    if(this.loginform.valid) 
    {
      this.isLoading = true;
      this.auth.login(this.loginform).subscribe(res =>
      {
        // checks the value of the GET request
        if(res >= 0)
        {
          this.es.getEmpCrendentials(res).subscribe(val => {
            
            this.employee = val;
            if(val.emp_IsAdmin)
            {
              this.router.navigate(['main'])
              this.loginform.reset()

              // stores employee in browser session
              sessionStorage.setItem('emp', JSON.stringify(val));
            }
            else
            {
              Swal.fire("Not an Admin", "Please use the app as this site is admin only", "info");
              this.isLoading = false;
            }
          })
        }
        else
        {
          Swal.fire("Login Error!", "Incorrect email or password, please try again.", "error");
          this.isLoading = false;
        }
      })
    }
    else
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.loginform)
    }
  }
}
