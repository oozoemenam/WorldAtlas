import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseFormComponent } from '../base-form.component';
import { MaterialModule } from '../material/material.module';
import { AuthService } from './auth.service';
import { LoginRequest } from './login-request.model';
import { LoginResponse } from './login-response.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent extends BaseFormComponent implements OnInit {
  title?: string;
  loginResponse?: LoginResponse;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    const loginRequest: LoginRequest = {
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value,
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log(response);
        this.loginResponse = response;
        if (response.success) {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.log(error);
        if (error.status == 401) {
          this.loginResponse = error.error;
        }
      },
    });
  }
}
