import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../services/environments/environment';
import { ProfilDto } from '../../types/entities';

/**
 * Composant de gestion du profil utilisateur
 */
@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Formulaire et données
  profileForm: FormGroup;
  userProfile: ProfilDto | null = null;
  
  // Gestion des fichiers et état
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;
  isEditing = false;
  
  // Configuration
  environment = environment;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    // Initialisation du formulaire avec validation
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      username: [{value: '', disabled: true}]
    });
  }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.loadProfile();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge le profil de l'utilisateur
   */
  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.handleProfileLoadSuccess(profile);
      },
      error: (err) => {
        this.handleProfileLoadError(err);
      }
    });
  }

  /**
   * Gère le succès du chargement du profil
   */
  private handleProfileLoadSuccess(profile: ProfilDto): void {
    this.userProfile = profile;
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      username: profile.username
    });
    this.previewUrl = profile.profileImagePath 
      ? `${environment.apiUrl}${profile.profileImagePath}` 
      : 'assets/images/default-avatar.png';
    this.isLoading = false;
    this.profileForm.disable();
  }

  /**
   * Gère l'erreur de chargement du profil
   */
  private handleProfileLoadError(err: any): void {
    this.toastr.error('Failed to load profile', 'Error');
    this.isLoading = false;
  }

  // =============================================
  // SECTION: GESTION DES IMAGES
  // =============================================

  /**
   * Gère la sélection d'un fichier image
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crée un aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  /**
   * Upload l'image de profil sélectionnée
   */
  uploadImage(): void {
    if (this.selectedFile && this.userProfile) {
      this.isLoading = true;
      this.profileService.uploadProfileImage(this.selectedFile).subscribe({
        next: (response: any) => {
          this.handleImageUploadSuccess(response);
        },
        error: (err) => {
          this.handleImageUploadError(err);
        }
      });
    }
  }

  /**
   * Gère le succès de l'upload de l'image
   */
  private handleImageUploadSuccess(response: any): void {
    // Gère les réponses sous forme de string ou d'objet
    const imagePath = typeof response === 'string' ? response : response?.path;
    
    if (!imagePath) {
      throw new Error('No image path returned');
    }

    this.toastr.success('Profile image updated successfully', 'Success');
    this.userProfile!.profileImagePath = imagePath;
    this.previewUrl = `${environment.apiUrl}${imagePath}`;
    this.selectedFile = null;
    this.isLoading = false;
    
    // Notifie les autres composants du changement
    const updatedUser = {
      ...this.userProfile!,
      profileImagePath: imagePath
    };
    this.profileService.notifyProfileUpdate(updatedUser);
  }

  /**
   * Gère l'erreur d'upload de l'image
   */
  private handleImageUploadError(err: any): void {
    console.error('Full upload error:', err);
    const errorMessage = err.message || 'Failed to update profile image';
    this.toastr.success('Profile image updated successfully', 'Success');
    this.isLoading = false;
  }

  // =============================================
  // SECTION: GESTION DU PROFIL
  // =============================================

  /**
   * Bascule entre les modes édition et visualisation
   */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
      this.profileForm.get('username')?.disable();
    } else {
      this.profileForm.disable();
    }
  }

  /**
   * Sauvegarde les modifications du profil
   */
  saveProfile(): void {
    if (this.profileForm.valid && this.userProfile) {
      this.isLoading = true;
      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: (profile) => {
          this.handleProfileUpdateSuccess(profile);
        },
        error: (err) => {
          this.handleProfileUpdateError(err);
        }
      });
    }
  }

  /**
   * Gère le succès de la mise à jour du profil
   */
  private handleProfileUpdateSuccess(profile: ProfilDto): void {
    this.userProfile = profile;
    this.toastr.success('Profile updated successfully', 'Success');
    this.isEditing = false;
    this.profileForm.disable();
    this.isLoading = false;
  }

  /**
   * Gère l'erreur de mise à jour du profil
   */
  private handleProfileUpdateError(err: any): void {
    this.toastr.error('Failed to update profile', 'Error');
    this.isLoading = false;
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne le nom affichable d'un rôle
   */
  getRoleDisplayName(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }

  /**
   * Retourne le nom affichable d'un type d'utilisateur
   */
  getUserTypeDisplayName(type: string): string {
    switch(type) {
      case 'ADMIN': return 'Administrator';
      case 'COWORKER': return 'Coworker';
      case 'RECEPTIONIST': return 'Receptionist';
      default: return type;
    }
  }
}