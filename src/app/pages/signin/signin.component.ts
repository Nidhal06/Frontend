// signin.component.ts (version corrigée)
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }


onSubmit() {
  if (this.loginForm.invalid) {
    return;
  }

  this.isLoading = true;
  this.authService.login({
    username: this.f['username'].value,
    password: this.f['password'].value
  }).subscribe({
    next: (response) => {
      this.isLoading = false;
      const user = this.authService.getCurrentUser();
      if (user && user.roles && user.roles.length > 0) {
        const redirectPath = this.authService.getRoleBasedRedirectPath(user.roles[0]);
        this.router.navigate([redirectPath]);
      } else {
        this.router.navigate(['/']);
      }
    },
    error: (error) => {
      this.isLoading = false;
      let errorMessage = 'Erreur de connexion';
      if (error.status === 401) {
        errorMessage = 'Identifiants incorrects';
      } else if (error.status === 403) {
        errorMessage = 'Compte désactivé ou non autorisé';
      }
      this.toastService.showError(errorMessage, 'Veuillez vérifier vos informations');
    }
  });
}
  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}