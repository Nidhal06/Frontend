import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  registerForm: FormGroup;
  showPassword = false;
  isLoading = false;
  userTypes = [
    { value: 'COWORKER', label: 'Coworker', description: 'Je cherche un espace de travail' },
    { value: 'COMPANY', label: 'Entreprise', description: 'Je représente une entreprise' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      phone: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
        Validators.pattern(/^[0-9]*$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(120),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      ]],
      type: ['COWORKER', Validators.required]
    });
  }

  get f() { return this.registerForm.controls; }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
  
    this.isLoading = true;
    
    const userData = {
      username: this.f['username'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      phone: this.f['phone'].value,
      type: this.f['type'].value
    };
  
    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('Inscription réussie !', 'Vous pouvez maintenant vous connecter');
        this.registerForm.reset({ type: 'COWORKER' });
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.showError(
          error || 'Erreur lors de l\'inscription',
          'Veuillez corriger les erreurs'
        );
      }
    });
  }
}