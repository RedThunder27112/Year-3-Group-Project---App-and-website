import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import ValidateForm from 'src/app/helpers/validateForm';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  hide = true;

  registerform!: FormGroup

  constructor(private fb: FormBuilder, 
              private auth: AuthService, 
              private http: HttpClient, 
              private router: Router) { }

  ngOnInit(): void {
    this.registerform = this.fb.group({

      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // registers new emails
      password: ['', Validators.required]
    })
  }

  onRegister() {
    if(this.registerform.valid) 
    {
      this.auth.register(this.registerform)
      .subscribe({
        next: (res) => {
          Swal.fire("Registration Successful!", "You may proceed to login.", "success"); 
          this.router.navigate(['/login']);
          this.registerform.reset()
        },
        error: (err) => {
          Swal.fire("Registration Error", "An error has occured, please try again.", "error");
        }
      })
    }
    else
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.registerform)
    }
  }
}
