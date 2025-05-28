
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../services/environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  token: string;
  success = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }

  get f() { return this.resetForm.controls; }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) {
      return;
    }

    this.isLoading = true;

    this.http.post(`${environment.apiUrl}/api/auth/reset-password`, {
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.success = true;
        this.isLoading = false;
        this.toastService.showSuccess('Succès', 'Votre mot de passe a été réinitialisé avec succès.');
        setTimeout(() => this.router.navigate(['/signin']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.showError('Erreur', 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      }
    });
  }
}