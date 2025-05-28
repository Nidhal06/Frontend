import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../services/environments/environment';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private http: HttpClient
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    this.http.post(`${environment.apiUrl}/api/auth/forgot-password`, {
      email: this.forgotForm.value.email
    }).subscribe({
      next: () => {
        this.successMessage = 'Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.';
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showError('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation.');
        this.isLoading = false;
      }
    });
  }
}