import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EspaceOuvertDTO, AbonnementDTO, ReservationDTO, UserDTO } from '../../../types/entities';
import { EspaceService } from '../../../services/espace.service';
import { AbonnementService } from '../../../services/abonnement.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../services/environments/environment';
import { Modal } from 'bootstrap';
import { ReservationService } from '../../../services/reservation.service';
import { IndisponibiliteService } from 'src/app/services/indisponibilite.service';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

/**
 * Composant OpenSpace - Gestion des espaces ouverts et des abonnements
 */
@Component({
  selector: 'app-open-space',
  templateUrl: './open-space.component.html',
  styleUrls: ['./open-space.component.css']
})
export class OpenSpaceComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Références aux éléments du DOM
  @ViewChild('lightboxModal') lightboxModalEl!: ElementRef;
  @ViewChild('unsubscribeModal') unsubscribeModalEl!: ElementRef;
  
  // Modales
  lightboxModal?: Modal;
  unsubscribeModal?: Modal;

  // Données des espaces
  espacesOuverts: EspaceOuvertDTO[] = [];
  space: EspaceOuvertDTO | null = null;
  spaceRatings: {[key: number]: number} = {};

  // Galerie d'images
  galleryImages: string[] = [];
  currentImageIndex = 0;

  // Abonnements
  abonnements: AbonnementDTO[] = [];
  availableSubscriptions: AbonnementDTO[] = [];
  userSubscriptions: AbonnementDTO[] = [];
  subscriptionType: 'MENSUEL' | 'ANNUEL' | null = null;

  // Réservations
  unavailableDates: Date[] = [];
  reservedDates: Date[] = [];
  selectedDate: NgbDateStruct | null = null;
  minDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  showDatePicker = false;

  // Utilisateur
  currentUser: UserDTO | null = null;

  // États
  isLoading = true;
  safeLocationUrl: SafeResourceUrl | null = null;
  environment = environment;

  // Avantages
  benefits = [
    { icon: 'bi-infinity', title: 'Accès illimité', description: 'Utilisez librement tous nos espaces de travail' },
    { icon: 'bi-wifi', title: 'Wi-Fi Haut Débit', description: 'Profitez d\'une connexion rapide et stable partout' },
    { icon: 'bi-cup-hot', title: 'Café & Snacks', description: 'Dégustez boissons chaudes et en-cas à volonté' },
    { icon: 'bi-calendar-event', title: 'Événements exclusifs', description: 'Participez à des rencontres privées entre membres' },
    { icon: 'bi-car-front-fill', title: 'Parking privé', description: 'Accès gratuit à notre parking sécurisé sur place' }
  ];

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private sanitizer: DomSanitizer,
    private espaceService: EspaceService,
    private indisponibiliteService: IndisponibiliteService,
    private abonnementService: AbonnementService,
    private reservationService: ReservationService,
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private calendar: NgbCalendar
  ) {
    // Configuration des dates min/max pour le calendrier
    const today = new Date();
    this.minDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.maxDate = { year: today.getFullYear() + 10, month: 12, day: 31 };
  }

  ngOnInit(): void {
    this.loadEspacesOuverts();
    this.loadAvailableSubscriptions();
    this.safeLocationUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.app.goo.gl/u8s9KhVP8uh71Gdf7'
    );

    if (this.authService.isLoggedIn()) {
      this.loadUserSubscriptions();
    }
  }

  ngAfterViewInit(): void {
    this.lightboxModal = new Modal(this.lightboxModalEl.nativeElement);
    this.unsubscribeModal = new Modal(this.unsubscribeModalEl.nativeElement);
  }

  // =============================================
  // SECTION: GESTION DES ESPACES
  // =============================================

  /**
   * Charge la liste des espaces ouverts depuis l'API
   */
  loadEspacesOuverts(): void {
    this.isLoading = true;
    this.espaceService.getAllEspaceOuverts().subscribe({
      next: (espaces) => {
        this.processEspaces(espaces);
        this.isLoading = false;
      },
      error: (error) => {
        this.handleLoadEspacesError(error);
      }
    });
  }

  /**
   * Traite les espaces récupérés pour formater les URLs des images
   */
  private processEspaces(espaces: EspaceOuvertDTO[]): void {
    this.espacesOuverts = espaces.map(espace => {
      const photoPrincipalUrl = espace.photoPrincipal 
        ? `${environment.apiUrl}${espace.photoPrincipal}`
        : 'assets/images/default-space.jpg';

      const galleryUrls = espace.gallery?.map(image => 
        image.startsWith('http') ? image : `${environment.apiUrl}${image}`
      ) || [];

      if (galleryUrls.length > 0) {
        this.galleryImages = [...this.galleryImages, ...galleryUrls];
      } else {
        this.galleryImages.push(photoPrincipalUrl);
      }

      return {
        ...espace,
        photoPrincipal: photoPrincipalUrl,
        gallery: galleryUrls
      };
    });
    
    if (this.galleryImages.length === 0) {
      this.setDefaultGalleryImages();
    }
  }

  /**
   * Gère les erreurs de chargement des espaces
   */
  private handleLoadEspacesError(error: any): void {
    console.error('Error loading open spaces:', error);
    this.isLoading = false;
    this.toastr.error('Erreur lors du chargement des espaces ouverts', 'Erreur');
    this.setDefaultGalleryImages();
  }

  /**
   * Définit des images par défaut pour la galerie
   */
  private setDefaultGalleryImages(): void {
    this.galleryImages = [
      'assets/images/open-space1.jpg',
      'assets/images/open-space2.jpg',
      'assets/images/open-space3.jpg'
    ];
  }

  /**
   * Récupère la note d'un espace (mock)
   */
  getSpaceRating(spaceId: number | undefined): string {
    if (!spaceId) return '4.8';
    if (!this.spaceRatings[spaceId]) {
      this.spaceRatings[spaceId] = parseFloat((Math.random() * 0.5 + 4.5).toFixed(1));
    }
    return this.spaceRatings[spaceId].toFixed(1);
  }

  // =============================================
  // SECTION: GESTION DES ABONNEMENTS
  // =============================================

  /**
   * Charge les abonnements disponibles
   */
  loadAvailableSubscriptions(): void {
    this.abonnementService.getAllAbonnements().subscribe({
      next: (abonnements) => {
        this.processAvailableSubscriptions(abonnements);
      },
      error: (error) => {
        this.handleLoadSubscriptionsError(error);
      }
    });
  }

  /**
   * Traite les abonnements disponibles
   */
  private processAvailableSubscriptions(abonnements: AbonnementDTO[]): void {
    this.availableSubscriptions = this.getUniqueSubscriptionsByType(abonnements);
    
    if (this.availableSubscriptions.length === 0) {
      this.createDefaultSubscriptions();
    }
  }

  /**
   * Charge les abonnements de l'utilisateur
   */
  loadUserSubscriptions(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.isLoading = true;
    this.abonnementService.getAllAbonnements().subscribe({
      next: (abonnements) => {
        this.userSubscriptions = abonnements.filter(sub => sub.userId === userId);
        this.isLoading = false;
      },
      error: (error) => {
        this.handleLoadUserSubscriptionsError(error);
      }
    });
  }

  /**
   * Gère les erreurs de chargement des abonnements utilisateur
   */
  private handleLoadUserSubscriptionsError(error: any): void {
    console.error('Error loading user subscriptions:', error);
    this.isLoading = false;
    this.toastr.error('Erreur lors du chargement de vos abonnements', 'Erreur');
  }

  /**
   * Crée des abonnements par défaut
   */
  private createDefaultSubscriptions(): void {
    const today = new Date();
    this.availableSubscriptions = [
      this.createDefaultSubscription('MENSUEL', 650, today),
      this.createDefaultSubscription('ANNUEL', 7000, today)
    ];
  }

  /**
   * Crée un abonnement par défaut
   */
  private createDefaultSubscription(type: 'MENSUEL' | 'ANNUEL', prix: number, date: Date): AbonnementDTO {
    return {
      id: type === 'MENSUEL' ? 1 : 2,
      type,
      prix,
      dateDebut: date.toISOString(),
      dateFin: this.calculateEndDate(type, date),
      userId: 0,
      userEmail: '',
      espaceOuvertId: 0,
      espaceOuvertName: ''
    };
  }

  /**
   * Filtre les abonnements par type unique
   */
  private getUniqueSubscriptionsByType(abonnements: AbonnementDTO[]): AbonnementDTO[] {
    const uniqueTypes = new Set<string>();
    const result: AbonnementDTO[] = [];
    
    for (const abonnement of abonnements) {
      if (!uniqueTypes.has(abonnement.type)) {
        uniqueTypes.add(abonnement.type);
        result.push(abonnement);
      }
    }
    
    // Ajoute les types manquants
    if (!uniqueTypes.has('MENSUEL')) {
      result.push(this.createDefaultSubscription('MENSUEL', 650, new Date()));
    }
    
    if (!uniqueTypes.has('ANNUEL')) {
      result.push(this.createDefaultSubscription('ANNUEL', 7000, new Date()));
    }
    
    return result;
  }

  /**
   * Vérifie si l'utilisateur a un abonnement actif
   */
  hasActiveSubscription(): boolean {
    if (!this.authService.isLoggedIn()) return false;
    return this.userSubscriptions.length > 0;
  }

  /**
   * Récupère le type d'abonnement actif
   */
  getActiveSubscriptionType(): string {
    if (!this.hasActiveSubscription()) return '';
    return this.userSubscriptions[0].type === 'MENSUEL' ? 'Mensuel' : 'Annuel';
  }

  /**
   * Récupère un abonnement par son type
   */
  getSubscriptionByType(type: 'MENSUEL' | 'ANNUEL'): AbonnementDTO | undefined {
    return this.availableSubscriptions.find(sub => sub.type === type);
  }

  // =============================================
  // SECTION: GESTION DES RÉSERVATIONS
  // =============================================

  /**
   * Charge les dates indisponibles pour un espace
   */
  private async loadUnavailableDates(espaceId: number): Promise<void> {
    try {
      const [indisponibilites, reservations] = await Promise.all([
        this.indisponibiliteService.getAllIndisponibilites().toPromise(),
        this.reservationService.getReservationsBySpace(espaceId).toPromise()
      ]);
      
      this.processUnavailableDates(indisponibilites, reservations, espaceId);
    } catch (error) {
      console.error('Error loading unavailable dates:', error);
    }
  }

  /**
   * Traite les dates indisponibles
   */
  private processUnavailableDates(
    indisponibilites: any[] | undefined,
    reservations: any[] | undefined,
    espaceId: number
  ): void {
    // Process indisponibilites
    this.unavailableDates = indisponibilites
      ?.filter(indispo => indispo.espaceId === espaceId)
      .flatMap(indispo => this.getDatesBetween(new Date(indispo.dateDebut), new Date(indispo.dateFin))) || [];
    
    // Process reservations
    this.reservedDates = reservations
      ?.filter(res => res.espaceId === espaceId)
      .flatMap(res => this.getDatesBetween(new Date(res.dateDebut), new Date(res.dateFin))) || [];
  }

  /**
   * Récupère toutes les dates entre deux dates
   */
  private getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Vérifie si une date est indisponible
   */
  isDateDisabled = (date: NgbDateStruct) => {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    
    // Vérifie si la date est dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (jsDate < today) return true;
    
    // Vérifie si la date est indisponible
    const isUnavailable = this.unavailableDates.some(d => 
      d.getFullYear() === date.year && 
      d.getMonth() === date.month - 1 && 
      d.getDate() === date.day
    );
    
    // Vérifie si la date est déjà réservée
    const isReserved = this.reservedDates.some(d => 
      d.getFullYear() === date.year && 
      d.getMonth() === date.month - 1 && 
      d.getDate() === date.day
    );
    
    return isUnavailable || isReserved;
  };

  // =============================================
  // SECTION: GESTION DES ABONNEMENTS
  // =============================================

  /**
   * Souscrit à un plan d'abonnement
   */
  subscribeToPlan(planType: 'MENSUEL' | 'ANNUEL'): void {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    const espaceOuvert = this.espacesOuverts[0];
    if (!espaceOuvert) {
      this.toastr.error('Aucun espace ouvert disponible', 'Erreur');
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastr.error('Impossible de récupérer l\'ID utilisateur', 'Erreur');
      return;
    }

    const selectedSubscription = this.getSubscriptionByType(planType);
    if (!selectedSubscription) {
      this.toastr.error('Abonnement non disponible', 'Erreur');
      return;
    }

    this.createSubscription(planType, userId, espaceOuvert, selectedSubscription.prix);
  }

  /**
   * Crée un nouvel abonnement
   */
  private createSubscription(
    planType: 'MENSUEL' | 'ANNUEL',
    userId: number,
    espaceOuvert: EspaceOuvertDTO,
    prix: number
  ): void {
    const today = new Date();
    const abonnement: AbonnementDTO = {
      type: planType,
      prix,
      dateDebut: today.toISOString(),
      dateFin: this.calculateEndDate(planType, today),
      userId,
      userEmail: this.currentUser?.email || '',
      espaceOuvertId: espaceOuvert.id || 0,
      espaceOuvertName: espaceOuvert.name || ''
    };

    this.isLoading = true;
    this.abonnementService.createAbonnement(abonnement).subscribe({
      next: () => {
        this.handleSubscriptionSuccess();
      },
      error: (error) => {
        this.handleSubscriptionError(error);
      }
    });
  }

  /**
   * Gère le succès de la création d'abonnement
   */
  private handleSubscriptionSuccess(): void {
    this.isLoading = false;
    this.toastr.success('Abonnement créé avec succès', 'Succès');
    this.loadUserSubscriptions();
  }

  /**
   * Gère les erreurs de création d'abonnement
   */
  private handleSubscriptionError(error: any): void {
    this.isLoading = false;
    console.error('Error creating subscription:', error);
    this.toastr.error('Erreur lors de la création de l\'abonnement', 'Erreur');
  }

  /**
   * Sélectionne un type d'abonnement
   */
  selectSubscription(type: 'MENSUEL' | 'ANNUEL'): void {
    if (!this.hasActiveSubscription()) {
      this.subscribeToPlan(type);
      return;
    }

    const espace = this.espacesOuverts[0];
    if (espace && espace.id) {
      this.loadUnavailableDates(espace.id);
    }
    
    this.subscriptionType = type;
    this.showDatePicker = true;
    this.selectedDate = null;
  }

  /**
   * Calcule la date de fin d'abonnement
   */
  private calculateEndDate(planType: 'MENSUEL' | 'ANNUEL', startDate?: Date): string {
    const date = startDate ? new Date(startDate) : new Date();
    
    if (planType === 'MENSUEL') {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
    } else {
      date.setFullYear(date.getFullYear() + 1);
      date.setMonth(11);
      date.setDate(31);
      date.setHours(23, 59, 59, 999);
    }
    
    return date.toISOString();
  }

  // =============================================
  // SECTION: GESTION DES DÉSABONNEMENTS
  // =============================================

  /**
   * Lance le processus de désabonnement
   */
  unsubscribe(): void {
    if (!this.authService.isLoggedIn() || !this.hasActiveSubscription()) {
      return;
    }
    this.unsubscribeModal?.show();
  }

  /**
   * Confirme le désabonnement
   */
  confirmUnsubscribe(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastr.error('Impossible de récupérer l\'ID utilisateur', 'Erreur');
      return;
    }

    const userSubscription = this.userSubscriptions[0];
    if (!userSubscription || !userSubscription.id) {
      this.toastr.error('Abonnement introuvable', 'Erreur');
      return;
    }

    this.deleteSubscription(userSubscription.id);
  }

  /**
   * Supprime un abonnement
   */
  private deleteSubscription(subscriptionId: number): void {
    this.isLoading = true;
    this.abonnementService.deleteAbonnement(subscriptionId).subscribe({
      next: () => {
        this.handleUnsubscribeSuccess();
      },
      error: (error) => {
        this.handleUnsubscribeError(error);
      }
    });
  }

  /**
   * Gère le succès du désabonnement
   */
  private handleUnsubscribeSuccess(): void {
    this.isLoading = false;
    this.toastr.success('Désabonnement effectué avec succès', 'Succès');
    this.loadUserSubscriptions();
  }

  /**
   * Gère les erreurs de désabonnement
   */
  private handleUnsubscribeError(error: any): void {
    this.isLoading = false;
    console.error('Error unsubscribing:', error);
    this.toastr.error('Erreur lors du désabonnement', 'Erreur');
  }

  // =============================================
  // SECTION: GESTION DES RÉSERVATIONS
  // =============================================

  /**
   * Sélectionne une date dans le calendrier
   */
  onDateSelect(date: NgbDateStruct): void {
    this.selectedDate = date;
  }

  /**
   * Calcule la date de fin à partir de la date sélectionnée
   */
  calculateEndDateFromSelected(): Date {
    if (!this.selectedDate || !this.subscriptionType) return new Date();

    const startDate = new Date(
      this.selectedDate.year,
      this.selectedDate.month - 1,
      this.selectedDate.day
    );

    return this.calculateEndDateFromStartDate(startDate, this.subscriptionType);
  }

  /**
   * Calcule la date de fin à partir d'une date de début
   */
  private calculateEndDateFromStartDate(startDate: Date, type: 'MENSUEL' | 'ANNUEL'): Date {
    const endDate = new Date(startDate);
    
    if (type === 'MENSUEL') {
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setMonth(11);
      endDate.setDate(31);
      endDate.setHours(23, 59, 59, 999);
    }
    
    return endDate;
  }

  /**
   * Formate la plage de dates sélectionnée
   */
  getFormattedDateRange(): string {
    if (!this.selectedDate || !this.subscriptionType) return '';

    const startDate = new Date(
      this.selectedDate.year,
      this.selectedDate.month - 1,
      this.selectedDate.day
    );
    const endDate = this.calculateEndDateFromStartDate(startDate, this.subscriptionType);

    return `Du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}`;
  }

  /**
   * Calcule le prix de l'abonnement
   */
  calculateSubscriptionPrice(): number {
    if (!this.space) return 0;
    
    if (this.hasActiveSubscription() && this.space.type === 'OUVERT') {
      const activeSub = this.userSubscriptions[0];
      return activeSub?.prix || 0;
    }
    
    return this.space.prixParJour || 0;
  }

  /**
   * Effectue une réservation
   */
  async reserveNow(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    if (!this.hasActiveSubscription()) {
      this.toastr.warning('Vous devez souscrire à un abonnement avant de pouvoir réserver un espace ouvert', 'Abonnement requis');
      return;
    }

    if (!this.selectedDate || !this.subscriptionType) {
      this.toastr.warning('Veuillez sélectionner une date et un type d\'abonnement', 'Information manquante');
      return;
    }

    const espace = this.espacesOuverts[0];
    if (!espace || !espace.id) {
      this.toastr.error('Aucun espace disponible pour réservation', 'Erreur');
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastr.error('Impossible de récupérer l\'ID utilisateur', 'Erreur');
      return;
    }

    try {
      await this.processReservation(espace, userId);
    } catch (error) {
      this.handleReservationError(error);
    }
  }

  /**
   * Traite la réservation
   */
  private async processReservation(espace: EspaceOuvertDTO, userId: number): Promise<void> {
    const [userSubs, indisponibilites, reservations] = await Promise.all([
      this.abonnementService.getAbonnementsByUser(userId).toPromise(),
      this.indisponibiliteService.getAllIndisponibilites().toPromise(),
      this.reservationService.getReservationsBySpace(espace.id ?? 0).toPromise()
    ]);

    const activeSubscription = userSubs?.find(sub => 
      new Date(sub.dateFin) > new Date() && sub.userId === userId
    );

    if (!activeSubscription) {
      this.toastr.error('Aucun abonnement actif valide trouvé', 'Erreur');
      return;
    }

    const startDate = new Date(
      this.selectedDate!.year,
      this.selectedDate!.month - 1,
      this.selectedDate!.day
    );
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = this.calculateEndDateFromSelected();
    endDate.setHours(23, 59, 59, 999);

    this.validateReservationDates(espace, startDate, endDate, indisponibilites, reservations);
  }

  /**
   * Valide les dates de réservation
   */
  private validateReservationDates(
    espace: EspaceOuvertDTO,
    startDate: Date,
    endDate: Date,
    indisponibilites: any[] | undefined,
    reservations: any[] | undefined
  ): void {
    const isIndisponible = indisponibilites?.some(indispo => {
      const indispoStart = new Date(indispo.dateDebut);
      const indispoEnd = new Date(indispo.dateFin);
      return (
        (indispoStart <= endDate && indispoEnd >= startDate) &&
        indispo.espaceId === espace.id
      );
    });

    if (isIndisponible) {
      this.toastr.error('Cet espace est indisponible pour la période sélectionnée', 'Indisponible');
      return;
    }

    const hasReservationConflict = reservations?.some(reservation => {
      const resStart = new Date(reservation.dateDebut);
      const resEnd = new Date(reservation.dateFin);
      return (startDate < resEnd && endDate > resStart);
    });

    if (hasReservationConflict) {
      this.toastr.error('Cet espace est déjà réservé pour la période sélectionnée', 'Réservation existante');
      return;
    }

    this.createReservation(espace, startDate, endDate);
  }

  /**
   * Crée la réservation
   */
  private createReservation(espace: EspaceOuvertDTO, startDate: Date, endDate: Date): void {
    const userId = this.authService.getCurrentUserId()!;
    const activeSubscription = this.userSubscriptions[0];

    const reservation: ReservationDTO = {
      userId: userId,
      userFirstName: this.currentUser?.firstName || '',
      userLastName: this.currentUser?.lastName || '',
      userEmail: this.currentUser?.email || '',
      userPhone: this.currentUser?.phone || '',
      espaceId: espace.id ?? 0,
      espaceName: espace.name,
      espaceType: 'OUVERT',
      dateDebut: startDate.toISOString(),
      dateFin: endDate.toISOString(),
      paiementMontant: activeSubscription.prix,
      statut: 'EN_ATTENTE',
      paiementValide: false,
    };

    this.isLoading = true;
    this.reservationService.createReservation(reservation).subscribe({
      next: () => {
        this.handleReservationSuccess();
      },
      error: (error) => {
        this.handleReservationError(error);
      }
    });
  }

  /**
   * Gère le succès de la réservation
   */
  private handleReservationSuccess(): void {
    this.isLoading = false;
    this.toastr.success('Réservation créée avec succès', 'Succès');
    this.router.navigate(['/spaces']);
    this.resetReservationForm();
  }

  /**
   * Gère les erreurs de réservation
   */
  private handleReservationError(error: any): void {
    this.isLoading = false;
    console.error('Error creating reservation:', error);
    this.toastr.error(error.error?.message || 'Erreur lors de la création de la réservation', 'Erreur');
  }

  /**
   * Réinitialise le formulaire de réservation
   */
  resetReservationForm(): void {
    this.selectedDate = null;
    this.subscriptionType = null;
    this.showDatePicker = false;
  }

  // =============================================
  // SECTION: GESTION DE LA GALERIE
  // =============================================

  /**
   * Ouvre la lightbox avec l'image sélectionnée
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
  // SECTION: UTILITAIRES
  // =============================================

  /**
   * Redirige vers la page de connexion
   */
  private redirectToLogin(): void {
    this.toastr.info('Veuillez vous connecter pour effectuer cette action', 'Connexion requise');
    this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
  }

  /**
   * Gère les erreurs de chargement des abonnements
   */
  private handleLoadSubscriptionsError(error: any): void {
    console.error('Error loading subscriptions:', error);
    this.toastr.error('Erreur lors du chargement des abonnements', 'Erreur');
    this.createDefaultSubscriptions();
  }
}