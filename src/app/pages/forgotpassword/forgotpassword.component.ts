import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../services/environments/environment';
import { ToastService } from '../../services/toast.service';

/**
 * Composant ForgotPassword - Gestion de la réinitialisation de mot de passe
 */
@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Formulaire de demande de réinitialisation
  forgotForm: FormGroup;
  
  // État de chargement pendant la requête
  isLoading = false;
  
  // Message de succès à afficher
  successMessage = '';

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    // Initialisation du formulaire avec validation
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // =============================================
  // SECTION: ACCÈS AUX CONTROLES DU FORMULAIRE
  // =============================================

  /**
   * Getter pour accéder facilement aux contrôles du formulaire
   * @returns Les contrôles du formulaire
   */
  get f() {
    return this.forgotForm.controls;
  }

  // =============================================
  // SECTION: SOUMISSION DU FORMULAIRE
  // =============================================

  /**
   * Gère la soumission du formulaire de réinitialisation
   */
  onSubmit() {
    // Vérifie la validité du formulaire et l'état de chargement
    if (this.forgotForm.invalid || this.isLoading) {
      return;
    }

    // Initialise l'état de chargement et réinitialise le message de succès
    this.isLoading = true;
    this.successMessage = '';
    
    // Envoie la requête au serveur
    this.http.post(`${environment.apiUrl}/api/auth/forgot-password`, {
      email: this.forgotForm.value.email
    }).subscribe({
      next: () => {
        this.handleSuccess();
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  // =============================================
  // SECTION: GESTION DES RÉPONSES
  // =============================================

  /**
   * Gère le succès de la demande de réinitialisation
   */
  private handleSuccess(): void {
    this.successMessage = 'Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception (et les spams).';
    this.isLoading = false;
  }

  /**
   * Gère les erreurs de la demande de réinitialisation
   * @param err Erreur retournée par le serveur
   */
  private handleError(err: any): void {
    this.isLoading = false;
    this.toastService.showError(
      'Erreur', 
      err.error?.message || 'Échec de l\'envoi de l\'email. Veuillez réessayer.'
    );
  }
}