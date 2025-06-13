import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EspacePriveDTO, AvisDTO, ReservationDTO, UserDTO, IndisponibiliteDTO } from '../../../types/entities';
import { EspaceService } from '../../../services/espace.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { AvisService } from '../../../services/avis.service';
import { IndisponibiliteService } from '../../../services/indisponibilite.service';
import { ToastrService } from 'ngx-toastr';
import { NgbDateStruct, NgbTimeStruct, NgbDate, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../services/user.service';
import { environment } from 'src/app/services/environments/environment';

/**
 * Composant SpaceDetail - Affichage détaillé d'un espace privé avec réservation et avis
 */
@Component({
  selector: 'app-space-detail',
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css']
})
export class SpaceDetailComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Configuration et environnement
  environment = environment;

  // Données de l'espace
  space: EspacePriveDTO | null = null;
  loading = true;
  error: string | null = null;

  // Utilisateur courant
  currentUser: UserDTO | null = null;

  // Indisponibilités
  indisponibilites: IndisponibiliteDTO[] = [];

  // Réservations
  selectedDate: NgbDateStruct | null = null;
  selectedStartTime: NgbTimeStruct = { hour: 9, minute: 0, second: 0 };
  selectedEndTime: NgbTimeStruct = { hour: 17, minute: 0, second: 0 };
  bookingInProgress = false;
  bookingSuccess = false;
  bookingError: string = '';
  userReservations: ReservationDTO[] = [];
  allReservations: ReservationDTO[] = [];

  // Avis
  reviews: AvisDTO[] = [];
  newReview: { rating: number, commentaire: string } = { rating: 0, commentaire: '' };
  submittingReview = false;

  // Galerie
  activeImageIndex = 0;
  showLightbox = false;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private route: ActivatedRoute,
    private espaceService: EspaceService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private avisService: AvisService,
    private indisponibiliteService: IndisponibiliteService,
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
   * Initialise les données du composant
   */
  private initializeComponent(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const spaceId = parseInt(id);
      this.loadSpaceData(spaceId);
      
      if (this.authService.isLoggedIn() && this.authService.getCurrentUserId()) {
        const userId = this.authService.getCurrentUserId()!;
        this.loadUserData(userId, spaceId);
      }
    } else {
      this.handleMissingIdError();
    }
  }

  /**
   * Charge les données liées à l'espace
   * @param spaceId ID de l'espace
   */
  private loadSpaceData(spaceId: number): void {
    this.loadSpaceDetails(spaceId);
    this.loadReviews(spaceId);
    this.loadIndisponibilites(spaceId);
    this.loadAllReservationsForSpace(spaceId);
  }

  /**
   * Charge les données liées à l'utilisateur
   * @param userId ID de l'utilisateur
   * @param spaceId ID de l'espace
   */
  private loadUserData(userId: number, spaceId: number): void {
    this.loadCurrentUser(userId);
    this.loadUserReservations(userId, spaceId);
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
   * Charge les détails de l'espace
   * @param id ID de l'espace
   */
  loadSpaceDetails(id: number): void {
    this.loading = true;
    this.espaceService.getEspacePriveById(id).subscribe({
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
   * Traite les données de l'espace
   * @param space Données de l'espace
   */
  private processSpaceData(space: EspacePriveDTO): void {
    const cleanedPhoto = this.cleanImageUrl(space.photoPrincipal);
    const galleryImages = this.processGalleryImages(space.gallery);

    this.space = {
      ...space,
      photoPrincipal: cleanedPhoto
        ? `${environment.apiUrl}${cleanedPhoto}`
        : 'assets/images/default-space.jpg',
      gallery: galleryImages
    };
  }

  /**
   * Nettoie une URL d'image
   * @param imageUrl URL de l'image
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
   * Traite les images de la galerie
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
   * Gère les erreurs de chargement de l'espace
   * @param err Erreur survenue
   */
  private handleSpaceLoadError(err: any): void {
    this.error = 'Erreur lors du chargement des détails de l\'espace';
    this.loading = false;
    this.toastr.error(this.error, 'Erreur');
  }

  /**
   * Charge les avis de l'espace
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
   * Charge les indisponibilités de l'espace
   * @param spaceId ID de l'espace
   */
  loadIndisponibilites(spaceId: number): void {
    this.indisponibiliteService.getAllIndisponibilites().subscribe({
      next: (indisponibilites) => {
        this.indisponibilites = indisponibilites.filter(i => i.espaceId === spaceId);
      },
      error: (err) => {
        this.handleIndisponibilitesLoadError(err);
      }
    });
  }

  /**
   * Gère les erreurs de chargement des indisponibilités
   * @param err Erreur survenue
   */
  private handleIndisponibilitesLoadError(err: any): void {
    console.error('Error loading indisponibilites:', err);
    this.toastr.error('Erreur lors du chargement des indisponibilités', 'Erreur');
  }

  /**
   * Charge les réservations de l'utilisateur
   * @param userId ID de l'utilisateur
   * @param spaceId ID de l'espace
   */
  loadUserReservations(userId: number, spaceId: number): void {
    if (!userId || !spaceId) return;
    
    this.reservationService.getReservationsByUser(userId).subscribe({
      next: (reservations) => {
        this.userReservations = reservations.filter(r => r.espaceId === spaceId);
      },
      error: (err) => {
        this.handleUserReservationsLoadError(err);
      }
    });
  }

  /**
   * Gère les erreurs de chargement des réservations utilisateur
   * @param err Erreur survenue
   */
  private handleUserReservationsLoadError(err: any): void {
    console.error('Error loading user reservations:', err);
  }

  /**
   * Charge toutes les réservations de l'espace
   * @param spaceId ID de l'espace
   */
  loadAllReservationsForSpace(spaceId: number): void {
    this.reservationService.getReservationsBySpace(spaceId).subscribe({
      next: (reservations: ReservationDTO[]) => {
        this.allReservations = reservations;
      },
      error: (err) => {
        this.handleAllReservationsLoadError(err);
      }
    });
  }

  /**
   * Gère les erreurs de chargement de toutes les réservations
   * @param err Erreur survenue
   */
  private handleAllReservationsLoadError(err: any): void {
    console.error('Error loading all reservations:', err);
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
        this.handleCurrentUserLoadError(err);
      }
    });
  }

  /**
   * Gère les erreurs de chargement de l'utilisateur
   * @param err Erreur survenue
   */
  private handleCurrentUserLoadError(err: any): void {
    console.error('Error loading user:', err);
    this.toastr.error('Erreur lors du chargement des informations utilisateur', 'Erreur');
  }

  // =============================================
  // SECTION: GESTION DE LA GALERIE
  // =============================================

  /**
   * Ouvre une image dans la lightbox
   * @param index Index de l'image
   */
  openImage(index: number): void {
    this.activeImageIndex = index;
    this.showLightbox = true;
  }

  /**
   * Ferme la lightbox
   */
  closeLightbox(): void {
    this.showLightbox = false;
  }

  /**
   * Affiche l'image suivante dans la lightbox
   */
  nextImage(): void {
    if (this.space && this.space.gallery) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.space.gallery.length;
    }
  }

  /**
   * Affiche l'image précédente dans la lightbox
   */
  prevImage(): void {
    if (this.space && this.space.gallery) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.space.gallery.length) % this.space.gallery.length;
    }
  }

  // =============================================
  // SECTION: GESTION DES RÉSERVATIONS
  // =============================================

  /**
   * Calcule le prix estimé de la réservation
   * @returns Prix estimé
   */
  calculateEstimatedPrice(): number {
    if (!this.space || !this.selectedDate) return 0;
    
    const hours = this.calculateDurationInHours();
    const hourlyRate = this.space.prixParJour / 8; // Supposons 8h/jour
    
    return hours * hourlyRate;
  }

  /**
   * Calcule la durée de la réservation en heures
   * @returns Durée en heures
   */
  calculateDurationInHours(): number {
    const startHours = this.selectedStartTime.hour + this.selectedStartTime.minute / 60;
    const endHours = this.selectedEndTime.hour + this.selectedEndTime.minute / 60;
    
    return Math.max(0, endHours - startHours);
  }

  /**
   * Vérifie si une date est désactivée
   * @param date Date à vérifier
   * @returns Objet avec l'état et la raison
   */
  isDateDisabled(date: NgbDateStruct): { disabled: boolean, reason: 'indisponible' | 'reserved-by-user' | 'reserved-by-others' | null } {
    if (!this.space || !date) return { disabled: true, reason: null };
    
    const jsDate = new Date(date.year, date.month - 1, date.day);
    jsDate.setHours(0, 0, 0, 0);

    // Vérifier les indisponibilités
    const isIndisponible = this.indisponibilites.some((indispo: IndisponibiliteDTO) => {
      const start = new Date(indispo.dateDebut);
      const end = new Date(indispo.dateFin);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return jsDate >= start && jsDate <= end;
    });

    // Vérifier les réservations de l'utilisateur
    const userReservation = this.userReservations.find((reservation: ReservationDTO) => {
      const resDate = new Date(reservation.dateDebut);
      resDate.setHours(0, 0, 0, 0);
      return jsDate.getTime() === resDate.getTime();
    });

    // Vérifier les réservations des autres utilisateurs
    const otherReservation = this.allReservations.some((reservation: ReservationDTO) => {
      const resDate = new Date(reservation.dateDebut);
      resDate.setHours(0, 0, 0, 0);
      return jsDate.getTime() === resDate.getTime() && 
             reservation.userId !== this.authService.getCurrentUserId();
    });

    return {
      disabled: isIndisponible || !!userReservation || otherReservation || !this.space.isActive,
      reason: isIndisponible ? 'indisponible' : 
              (userReservation ? 'reserved-by-user' : 
               (otherReservation ? 'reserved-by-others' : null))
    };
  }

  /**
   * Retourne les classes CSS pour une date
   * @param date Date à vérifier
   * @returns Objet avec les classes CSS
   */
  getDateCustomClass(date: NgbDateStruct) {
    const state = this.isDateDisabled(date);
    if (state.disabled && state.reason) {
      return {
        [state.reason]: true,
        'disabled-date': true
      };
    }
    return {};
  }

  /**
   * Retourne le tooltip pour une date
   * @param date Date à vérifier
   * @returns Message du tooltip
   */
  getDateTooltip(date: NgbDateStruct): string {
    const state = this.isDateDisabled(date);
    if (!state.disabled) return '';
    
    if (state.reason === 'indisponible') {
      return 'Espace indisponible à cette date';
    } else if (state.reason === 'reserved-by-user') {
      return 'Vous avez déjà une réservation pour cet espace à cette date';
    } else if (state.reason === 'reserved-by-others') {
      return 'Espace déjà réservé par une autre personne';
    } else if (!this.space?.isActive) {
      return 'Espace actuellement indisponible';
    }
    
    return 'Date non disponible';
  }

  /**
   * Gère le survol d'une date
   * @param date Date survolée
   * @param tooltip Référence au tooltip
   */
  onDateHover(date: NgbDateStruct, tooltip: NgbTooltip): void {
    if (this.isDateDisabled(date).disabled) {
      tooltip.open();
    }
  }

  /**
   * Fonction de validation pour le datepicker
   * @param date Date à valider
   * @returns true si la date est désactivée
   */
  isDateDisabledForPicker = (date: NgbDate, current?: { year: number; month: number; }) => {
    const dateStruct = { year: date.year, month: date.month, day: date.day };
    return this.isDateDisabled(dateStruct).disabled;
  }

  /**
   * Vérifie si une date/heure est déjà réservée
   * @param date Date à vérifier
   * @param time Heure à vérifier
   * @returns true si déjà réservée
   */
  isDateTimeReserved(date: NgbDateStruct, time: NgbTimeStruct): boolean {
    if (!date || !time || !this.userReservations.length) return false;
    
    const selectedDateTime = new Date(
      date.year,
      date.month - 1,
      date.day,
      time.hour,
      time.minute
    );
    
    return this.userReservations.some(reservation => {
      const resStart = new Date(reservation.dateDebut);
      const resEnd = new Date(reservation.dateFin);
      return selectedDateTime >= resStart && selectedDateTime <= resEnd;
    });
  }

  /**
   * Effectue une réservation
   */
  bookSpace(): void {
    if (!this.validateBookingForm()) {
      return;
    }

    this.bookingInProgress = true;
    this.bookingError = '';

    const { startDate, endDate } = this.createBookingDates();
    
    if (!this.validateBookingDates(startDate, endDate)) {
      this.bookingInProgress = false;
      return;
    }

    const reservation = this.createReservationObject(startDate, endDate);
    this.submitReservation(reservation);
  }

  /**
   * Valide le formulaire de réservation
   * @returns true si le formulaire est valide
   */
  private validateBookingForm(): boolean {
    if (!this.space || !this.selectedDate || !this.authService.getCurrentUserId()) {
      this.bookingError = 'Veuillez remplir tous les champs requis';
      return false;
    }
    return true;
  }

  /**
   * Crée les dates de début et fin de réservation
   * @returns Objet avec startDate et endDate
   */
  private createBookingDates(): { startDate: Date, endDate: Date } {
    const startDate = new Date(
      this.selectedDate!.year,
      this.selectedDate!.month - 1,
      this.selectedDate!.day,
      this.selectedStartTime.hour,
      this.selectedStartTime.minute
    );

    const endDate = new Date(
      this.selectedDate!.year,
      this.selectedDate!.month - 1,
      this.selectedDate!.day,
      this.selectedEndTime.hour,
      this.selectedEndTime.minute
    );

    return { startDate, endDate };
  }

  /**
   * Valide les dates de réservation
   * @param startDate Date de début
   * @param endDate Date de fin
   * @returns true si les dates sont valides
   */
  private validateBookingDates(startDate: Date, endDate: Date): boolean {
    if (endDate <= startDate) {
      this.bookingError = 'L\'heure de fin doit être après l\'heure de début';
      return false;
    }

    if (this.isDateTimeRangeReserved(startDate, endDate)) {
      this.bookingError = 'Cet espace n\'est pas disponible pour la plage horaire sélectionnée';
      return false;
    }

    return true;
  }

  /**
   * Vérifie si une plage horaire est déjà réservée
   * @param startDate Date de début
   * @param endDate Date de fin
   * @returns true si déjà réservée
   */
  private isDateTimeRangeReserved(startDate: Date, endDate: Date): boolean {
    // Vérifier les indisponibilités
    const isIndisponible = this.indisponibilites.some((indispo: IndisponibiliteDTO) => {
      const indispoStart = new Date(indispo.dateDebut);
      const indispoEnd = new Date(indispo.dateFin);
      return (startDate < indispoEnd && endDate > indispoStart);
    });

    if (isIndisponible) return true;

    // Vérifier les réservations existantes
    const hasConflict = this.allReservations.some((reservation: ReservationDTO) => {
      const resStart = new Date(reservation.dateDebut);
      const resEnd = new Date(reservation.dateFin);
      return (startDate < resEnd && endDate > resStart);
    });

    return hasConflict;
  }

  /**
   * Crée un objet de réservation
   * @param startDate Date de début
   * @param endDate Date de fin
   * @returns Objet ReservationDTO
   */
  private createReservationObject(startDate: Date, endDate: Date): ReservationDTO {
    return {
      userId: this.authService.getCurrentUserId()!,
      userFirstName: this.currentUser?.firstName || '',
      userLastName: this.currentUser?.lastName || '',
      userEmail: this.currentUser?.email || '',
      userPhone: this.currentUser?.phone || '',
      espaceId: this.space!.id!,
      espaceName: this.space!.name,
      espaceType: 'PRIVE',
      dateDebut: startDate.toISOString(),
      dateFin: endDate.toISOString(),
      paiementMontant: this.calculateEstimatedPrice(),
      statut: 'EN_ATTENTE',
      paiementValide: false
    };
  }

  /**
   * Soumet la réservation au serveur
   * @param reservation Réservation à créer
   */
  private submitReservation(reservation: ReservationDTO): void {
    this.reservationService.createReservation(reservation).subscribe({
      next: (createdReservation) => {
        this.handleReservationSuccess(createdReservation);
      },
      error: (err) => {
        this.handleReservationError(err);
      }
    });
  }

  /**
   * Gère le succès de la réservation
   * @param createdReservation Réservation créée
   */
  private handleReservationSuccess(createdReservation: ReservationDTO): void {
    this.bookingSuccess = true;
    this.bookingInProgress = false;
    this.toastr.success('Réservation effectuée avec succès', 'Succès');
    
    // Recharger les réservations
    const userId = this.authService.getCurrentUserId()!;
    const spaceId = this.space!.id!;
    this.loadUserReservations(userId, spaceId);
    this.loadAllReservationsForSpace(spaceId);
  }

  /**
   * Gère les erreurs de réservation
   * @param err Erreur survenue
   */
  private handleReservationError(err: any): void {
    this.bookingError = err.error?.message || 'Erreur lors de la réservation';
    this.bookingInProgress = false;
    this.toastr.error(this.bookingError, 'Erreur');
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
   * Crée un nouvel avis
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
   * Vérifie si l'utilisateur est admin
   * @returns true si l'utilisateur est admin
   */
  isCurrentUserAdmin(): boolean {
    return this.authService.isAdmin();
  }
}