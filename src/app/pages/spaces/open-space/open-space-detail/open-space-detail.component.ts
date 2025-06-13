import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EspaceOuvertDTO, AvisDTO, UserDTO } from '../../../../types/entities';
import { EspaceService } from '../../../../services/espace.service';
import { AuthService } from '../../../../services/auth.service';
import { AvisService } from '../../../../services/avis.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../services/user.service';
import { environment } from 'src/app/services/environments/environment';
import { Modal } from 'bootstrap';

/**
 * Composant OpenSpaceDetail - Affichage détaillé d'un espace ouvert avec fonctionnalités associées
 */
@Component({
  selector: 'app-open-space-detail',
  templateUrl: './open-space-detail.component.html',
  styleUrls: ['./open-space-detail.component.css']
})
export class OpenSpaceDetailComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Référence à la modale lightbox
  @ViewChild('lightboxModal') lightboxModalEl!: ElementRef;
  lightboxModal?: Modal;
  
  // Configuration et environnement
  environment = environment;
  safeLocationUrl: SafeResourceUrl | null = null;

  // Données de l'espace
  space: EspaceOuvertDTO | null = null;
  loading = true;
  error: string | null = null;

  // Galerie d'images
  currentImageIndex = 0;
  galleryImages: string[] = [];

  // Utilisateur courant
  currentUser: UserDTO | null = null;

  // Avis et commentaires
  reviews: AvisDTO[] = [];
  newReview: { rating: number, commentaire: string } = { rating: 0, commentaire: '' };
  submittingReview = false;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private espaceService: EspaceService,
    private authService: AuthService,
    private avisService: AvisService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Initialisation après rendu de la vue
   */
  ngAfterViewInit(): void {
    this.lightboxModal = new Modal(this.lightboxModalEl.nativeElement);
  }

  /**
   * Initialise les données du composant
   */
  private initializeComponent(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.initializeLocationMap();
      const spaceId = parseInt(id);
      this.loadSpaceDetails(spaceId);
      this.loadReviews(spaceId);
      
      if (this.authService.isLoggedIn() && this.authService.getCurrentUserId()) {
        const userId = this.authService.getCurrentUserId()!;
        this.loadCurrentUser(userId);
      }
    } else {
      this.handleMissingIdError();
    }
  }

  /**
   * Initialise l'URL de la carte de localisation
   */
  private initializeLocationMap(): void {
    this.safeLocationUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.app.goo.gl/u8s9KhVP8uh71Gdf7'
    );
  }

  /**
   * Gère l'erreur d'ID manquant
   */
  private handleMissingIdError(): void {
    this.error = 'ID de l\'espace non spécifié';
    this.loading = false;
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge les détails d'un espace ouvert
   * @param id ID de l'espace à charger
   */
  loadSpaceDetails(id: number): void {
    this.loading = true;
    this.espaceService.getEspaceOuvertById(id).subscribe({
      next: (space) => {
        this.processSpaceData(space);
        this.loading = false;
      },
      error: (err) => {
        this.handleSpaceLoadError(err);
      }
    });
  }

  /**
   * Traite les données de l'espace récupérées
   * @param space Données de l'espace
   */
  private processSpaceData(space: EspaceOuvertDTO): void {
    const cleanedPhoto = this.cleanImageUrl(space.photoPrincipal);
    const galleryUrls = this.processGalleryImages(space.gallery);

    this.space = {
      ...space,
      photoPrincipal: cleanedPhoto
        ? `${environment.apiUrl}${cleanedPhoto}`
        : 'assets/images/default-space.jpg',
      gallery: galleryUrls
    };

    this.initializeGalleryImages(cleanedPhoto, galleryUrls);
  }

  /**
   * Nettoie une URL d'image
   * @param imageUrl URL de l'image à nettoyer
   * @returns URL nettoyée
   */
  private cleanImageUrl(imageUrl: string | undefined): string | null {
    if (!imageUrl) return null;
    
    let cleanedUrl = imageUrl.replace(/^http:\/\/localhost:1010/, '');
    if (!cleanedUrl.startsWith('/')) {
      cleanedUrl = '/' + cleanedUrl;
    }
    return cleanedUrl;
  }

  /**
   * Traite les URLs de la galerie d'images
   * @param gallery Tableau d'URLs d'images
   * @returns Tableau d'URLs traitées
   */
  private processGalleryImages(gallery: string[] | undefined): string[] {
    return gallery?.map(image => {
      if (image) {
        const cleanedImage = this.cleanImageUrl(image);
        return cleanedImage ? `${environment.apiUrl}${cleanedImage}` : 'assets/images/default-gallery.jpg';
      } else {
        return 'assets/images/default-gallery.jpg';
      }
    }) || [];
  }

  /**
   * Initialise les images de la galerie
   * @param mainImageUrl URL de l'image principale
   * @param galleryUrls URLs des images de la galerie
   */
  private initializeGalleryImages(mainImageUrl: string | null, galleryUrls: string[]): void {
    this.galleryImages = [
      mainImageUrl ? `${environment.apiUrl}${mainImageUrl}` : 'assets/images/default-space.jpg',
      ...galleryUrls
    ];
  }

  /**
   * Gère les erreurs de chargement des espaces
   * @param err Erreur survenue
   */
  private handleSpaceLoadError(err: any): void {
    this.error = 'Erreur lors du chargement des détails de l\'espace';
    this.loading = false;
    this.toastr.error(this.error, 'Erreur');
  }

  /**
   * Charge les avis pour un espace
   * @param spaceId ID de l'espace
   */
  loadReviews(spaceId: number): void {
    this.avisService.getAvisByEspaceId(spaceId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        this.handleReviewsLoadError(err);
      }
    });
  }

  /**
   * Gère les erreurs de chargement des avis
   * @param err Erreur survenue
   */
  private handleReviewsLoadError(err: any): void {
    this.toastr.error('Erreur lors du chargement des avis', 'Erreur');
  }

  /**
   * Charge les informations de l'utilisateur courant
   * @param userId ID de l'utilisateur
   */
  loadCurrentUser(userId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Veuillez vous connecter', 'Authentification requise');
      return;
    }
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        this.handleUserLoadError(err);
      }
    });
  }

  /**
   * Gère les erreurs de chargement de l'utilisateur
   * @param err Erreur survenue
   */
  private handleUserLoadError(err: any): void {
    console.error('Error loading user:', err);
    this.toastr.error('Erreur lors du chargement des informations utilisateur', 'Erreur');
  }

  // =============================================
  // SECTION: GESTION DES AVIS
  // =============================================

  /**
   * Soumet un nouvel avis
   */
  submitReview(): void {
    if (!this.validateReviewForm()) {
      return;
    }

    this.submittingReview = true;
    const newAvis = this.createNewAvis();

    this.avisService.createAvis(newAvis).subscribe({
      next: (createdAvis) => {
        this.handleReviewSubmissionSuccess(createdAvis);
      },
      error: (err) => {
        this.handleReviewSubmissionError(err);
      }
    });
  }

  /**
   * Valide le formulaire d'avis
   * @returns true si le formulaire est valide
   */
  private validateReviewForm(): boolean {
    if (!this.space || !this.newReview.rating || !this.newReview.commentaire) {
      this.toastr.warning('Veuillez donner une note et un commentaire', 'Avis incomplet');
      return false;
    }

    if (!this.authService.getCurrentUserId() || !this.currentUser) {
      this.toastr.warning('Veuillez vous connecter pour poster un avis', 'Connexion requise');
      return false;
    }

    return true;
  }

  /**
   * Crée un nouvel objet AvisDTO
   * @returns Nouvel avis
   */
  private createNewAvis(): AvisDTO {
    return {
      userId: this.authService.getCurrentUserId()!,
      userUsername: this.currentUser!.username,
      userFirstName: this.currentUser!.firstName,
      userLastName: this.currentUser!.lastName,
      espaceId: this.space!.id!,
      espaceName: this.space!.name,
      espaceType: this.space!.type,
      rating: this.newReview.rating,
      commentaire: this.newReview.commentaire,
      date: new Date()
    };
  }

  /**
   * Gère le succès de la soumission d'un avis
   * @param createdAvis Avis créé
   */
  private handleReviewSubmissionSuccess(createdAvis: AvisDTO): void {
    this.reviews.unshift(createdAvis);
    this.newReview = { rating: 0, commentaire: '' };
    this.submittingReview = false;
    this.toastr.success('Votre avis a été publié', 'Merci !');
  }

  /**
   * Gère les erreurs de soumission d'un avis
   * @param err Erreur survenue
   */
  private handleReviewSubmissionError(err: any): void {
    this.submittingReview = false;
    this.toastr.error('Erreur lors de la publication de votre avis', 'Erreur');
  }

  /**
   * Supprime un avis
   * @param reviewId ID de l'avis à supprimer
   */
  deleteReview(reviewId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.avisService.deleteAvis(reviewId).subscribe({
        next: () => {
          this.handleReviewDeletionSuccess(reviewId);
        },
        error: (err) => {
          this.handleReviewDeletionError(err);
        }
      });
    }
  }

  /**
   * Gère le succès de la suppression d'un avis
   * @param reviewId ID de l'avis supprimé
   */
  private handleReviewDeletionSuccess(reviewId: number): void {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
    this.toastr.success('Avis supprimé avec succès', 'Succès');
  }

  /**
   * Gère les erreurs de suppression d'un avis
   * @param err Erreur survenue
   */
  private handleReviewDeletionError(err: any): void {
    this.toastr.error('Erreur lors de la suppression de l\'avis', 'Erreur');
  }

  // =============================================
  // SECTION: GESTION DE LA GALERIE
  // =============================================

  /**
   * Ouvre la lightbox avec une image spécifique
   * @param index Index de l'image à afficher
   */
  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.lightboxModal?.show();
  }

  /**
   * Affiche l'image précédente dans la lightbox
   */
  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  /**
   * Affiche l'image suivante dans la lightbox
   */
  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
  }

  // =============================================
  // SECTION: UTILITAIRES D'AUTHENTIFICATION
  // =============================================

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns true si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Vérifie si l'utilisateur courant est admin
   * @returns true si l'utilisateur est admin
   */
  isCurrentUserAdmin(): boolean {
    return this.authService.isAdmin();
  }
}