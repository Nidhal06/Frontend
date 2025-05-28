import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthRequest } from '../../types/entities';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const authRequest: AuthRequest = {
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.authService.login(authRequest).subscribe({
  next: (response) => {
    this.isLoading = false;
    this.toastr.success('Connexion réussie', 'Bienvenue !');
    
    // Redirect based on user role
    if (response.role === 'ADMIN') {
      this.router.navigate(['/admin-dashboard']);
    } else if (response.role === 'RECEPTIONISTE') {
      this.router.navigate(['/reception-dashboard']);
    } else if (response.role === 'COWORKER') {
      this.router.navigate(['/coworker-dashboard']);
    }
  },
  error: (error) => {
    this.isLoading = false;
    console.error('Login error:', error);
    
    if (error.error?.message) {
      this.toastr.error(error.error.message, 'Erreur de connexion');
    } else {
      this.toastr.error('Email ou mot de passe incorrect', 'Erreur de connexion');
    }
  }
});
  }
}