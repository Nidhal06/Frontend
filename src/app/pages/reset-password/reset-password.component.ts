import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../services/environments/environment';
import { ToastService } from '../../services/toast.service';

/**
 * Composant ResetPassword - Gestion de la réinitialisation de mot de passe
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Formulaire de réinitialisation
  resetForm: FormGroup;
  
  // État de chargement
  isLoading = false;
  
  // Token de réinitialisation
  token: string = '';
  
  // Indicateur de succès
  success = false;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    // Initialisation du formulaire avec validation
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  /**
   * Initialisation du composant
   */
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = decodeURIComponent(params['token'] || '');
      if (!this.token) {
        this.handleInvalidToken();
      }
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
    return this.resetForm.controls;
  }

  // =============================================
  // SECTION: VALIDATION DU FORMULAIRE
  // =============================================

  /**
   * Validateur personnalisé pour vérifier la correspondance des mots de passe
   * @param form Formulaire à valider
   * @returns Null si valide, objet d'erreur sinon
   */
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }

  // =============================================
  // SECTION: SOUMISSION DU FORMULAIRE
  // =============================================

  /**
   * Gère la soumission du formulaire de réinitialisation
   */
  onSubmit() {
    // Vérifie la validité du formulaire, l'état de chargement et la présence du token
    if (this.resetForm.invalid || this.isLoading || !this.token) {
      return;
    }

    this.isLoading = true;

    // Envoie la requête de réinitialisation
    this.http.post(`${environment.apiUrl}/api/auth/reset-password`, {
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.handleResetSuccess();
      },
      error: (err) => {
        this.handleResetError(err);
      }
    });
  }

  // =============================================
  // SECTION: GESTION DES RÉPONSES
  // =============================================

  /**
   * Gère le succès de la réinitialisation
   */
  private handleResetSuccess(): void {
    this.success = true;
    this.toastService.showSuccess('Succès', 'Mot de passe réinitialisé avec succès!');
    // Redirection après 3 secondes
    setTimeout(() => this.router.navigate(['/signin']), 3000);
  }

  /**
   * Gère les erreurs de réinitialisation
   * @param err Erreur retournée par le serveur
   */
  private handleResetError(err: any): void {
    this.isLoading = false;
    this.toastService.showError(
      'Erreur',
      err.error?.message || 'Échec de la réinitialisation. Le lien a peut-être expiré.'
    );
    
    // Redirection si erreur 400 (Bad Request)
    if (err.status === 400) {
      this.router.navigate(['/forgot-password']);
    }
  }

  /**
   * Gère les tokens invalides
   */
  private handleInvalidToken(): void {
    this.toastService.showError('Erreur', 'Lien de réinitialisation invalide');
    this.router.navigate(['/forgot-password']);
  }
}