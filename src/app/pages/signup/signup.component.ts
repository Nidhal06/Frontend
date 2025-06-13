import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupRequest } from '../../types/entities';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Composant Signup - Gestion de l'inscription des nouveaux utilisateurs
 */
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Formulaire d'inscription
  registerForm!: FormGroup;
  
  // Contrôle de l'affichage du mot de passe
  showPassword = false;
  
  // État de chargement pendant l'inscription
  isLoading = false;
  
  // Indicateur de soumission du formulaire
  submitted = false;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.initializeForm();
  }

  // =============================================
  // SECTION: INITIALISATION DU FORMULAIRE
  // =============================================

  /**
   * Initialise le formulaire d'inscription avec les validateurs
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]],
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
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]]
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
    return this.registerForm.controls; 
  }

  // =============================================
  // SECTION: GESTION DE L'INSCRIPTION
  // =============================================

  /**
   * Gère la soumission du formulaire d'inscription
   */
  onSubmit(): void {
    this.submitted = true;

    // Arrête si le formulaire est invalide
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Prépare la requête d'inscription
    const signupRequest: SignupRequest = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      username: this.f['username'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      phone: this.f['phone'].value
    };

    // Appel au service d'authentification
    this.authService.register(signupRequest).subscribe({
      next: () => {
        this.handleRegistrationSuccess();
      },
      error: (error) => {
        this.handleRegistrationError(error);
      }
    });
  }

  /**
   * Gère le succès de l'inscription
   */
  private handleRegistrationSuccess(): void {
    this.isLoading = false;
    this.toastr.success('Inscription réussie', 'Bienvenue !');
    this.router.navigate(['/signin']);
  }

  /**
   * Gère les erreurs d'inscription
   * @param error Erreur retournée par le serveur
   */
  private handleRegistrationError(error: any): void {
    this.isLoading = false;
    console.error('Registration error:', error);
    
    if (error.error && error.error.message) {
      this.toastr.error(error.error.message, 'Erreur d\'inscription');
    } else {
      this.toastr.error('Une erreur est survenue lors de l\'inscription', 'Erreur');
    }
  }

  // =============================================
  // SECTION: UTILITAIRES D'INTERFACE
  // =============================================

  /**
   * Bascule la visibilité du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}