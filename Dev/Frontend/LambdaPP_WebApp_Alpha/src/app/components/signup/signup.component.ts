import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from 'src/app/helpers/validateForm';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  // Form Validation
  signupForm!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      Name: ['', Validators.required],
      Surname: ['', Validators.required],
      // EmailAddress: ['', [Validators.email, Validators.required]],
      Username: ['', Validators.required],
      Password: ['', Validators.required],
      CPassword: ['', Validators.required],
    })
  }

  onSignUp() {
    if(this.signupForm.valid) 
    {
      this.auth.signup(this.signupForm)
      .subscribe({
        next: (res) => {
          alert("Registration Successful, Proceed to Login!")
          this.signupForm.reset()
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err.error.message)
        }
      })
    }
    else
    {
      // throw an error
      ValidateForm.valiateAllFormFields(this.signupForm)
    }
  }
}
