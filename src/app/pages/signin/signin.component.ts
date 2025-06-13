import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthRequest } from '../../types/entities';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Composant Signin - Gestion de l'authentification des utilisateurs
 */
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Formulaire de connexion
  loginForm!: FormGroup;
  
  // Contrôle de l'affichage du mot de passe
  showPassword = false;
  
  // État de chargement
  isLoading = false;
  
  // Indicateur de soumission
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

  /**
   * Initialise le formulaire de connexion avec les validateurs
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
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
    return this.loginForm.controls; 
  }

  // =============================================
  // SECTION: GESTION DE L'AUTHENTIFICATION
  // =============================================

  /**
   * Gère la soumission du formulaire de connexion
   */
  onSubmit(): void {
    this.submitted = true;

    // Arrête si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Prépare la requête d'authentification
    const authRequest: AuthRequest = {
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    // Appel au service d'authentification
    this.authService.login(authRequest).subscribe({
      next: (response) => {
        this.handleLoginSuccess(response);
      },
      error: (error) => {
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Gère le succès de l'authentification
   * @param response Réponse du serveur
   */
  private handleLoginSuccess(response: any): void {
    this.isLoading = false;
    this.toastr.success('Connexion réussie', 'Bienvenue !');
    
    // Redirection en fonction du rôle
    if (response.role === 'ADMIN') {
      this.router.navigate(['/admin-dashboard']);
    } else if (response.role === 'RECEPTIONISTE') {
      this.router.navigate(['/receptioniste-dashboard']);
    } else if (response.role === 'COWORKER') {
      this.router.navigate(['/coworker-dashboard']);
    }
  }

  /**
   * Gère les erreurs d'authentification
   * @param error Erreur retournée par le serveur
   */
  private handleLoginError(error: any): void {
    this.isLoading = false;
    console.error('Login error:', error);
    
    if (error.error?.message) {
      this.toastr.error(error.error.message, 'Erreur de connexion');
    } else {
      this.toastr.error('Email ou mot de passe incorrect', 'Erreur de connexion');
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