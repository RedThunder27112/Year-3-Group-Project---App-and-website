import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from 'src/app/helpers/validateForm';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  // Form Validation
  loginForm!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private http: HttpClient, private router: Router) { }
  
  ngOnInit(): void {
    this.loginForm = this.fb.group({

      Username: ['', Validators.required],
      Password: ['', Validators.required],
    })
  }

  onLogin() {
    if(this.loginForm.valid) 
    {
      this.auth.login(this.loginForm)
      .subscribe((res) =>
      {
        // checks the value of the GET request
        if(parseInt(res) >= 0)
        {
          // alert("Login Successful!")
          this.loginForm.reset()
          this.router.navigate(["/dashboard"]);
        }
        else
        {
          alert("Login Unsuccessful!")
        }
      })
    }
    else
    {
      // throw an error
      // ValidateForm.valiateAllFormFields(this.loginForm)
    }
  }
}
