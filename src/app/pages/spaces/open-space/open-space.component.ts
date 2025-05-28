import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EspaceOuvertDTO, AbonnementDTO , ReservationDTO, UserDTO} from '../../../types/entities';
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

@Component({
  selector: 'app-open-space',
  templateUrl: './open-space.component.html',
  styleUrls: ['./open-space.component.css']
})
export class OpenSpaceComponent implements OnInit {
  @ViewChild('lightboxModal') lightboxModalEl!: ElementRef;
  @ViewChild('unsubscribeModal') unsubscribeModalEl!: ElementRef;
  lightboxModal?: Modal;
  unsubscribeModal?: Modal;

  safeLocationUrl: SafeResourceUrl | null = null;
  espacesOuverts: EspaceOuvertDTO[] = [];
  galleryImages: string[] = [];
  abonnements: AbonnementDTO[] = [];
  availableSubscriptions: AbonnementDTO[] = [];
  userSubscriptions: AbonnementDTO[] = [];
  environment = environment;
  isLoading = true;
  currentImageIndex = 0;
  spaceRatings: {[key: number]: number} = {};
  space: EspaceOuvertDTO | null = null; 
  openspace: EspaceOuvertDTO[] = [];
  currentUser: UserDTO | null = null;
  subscriptions: AbonnementDTO[] = [];

  unavailableDates: Date[] = [];
  reservedDates: Date[] = [];

  // Propriétés pour le calendrier et la réservation
selectedDate: NgbDateStruct | null = null;
minDate: NgbDateStruct;
maxDate: NgbDateStruct;
subscriptionType: 'MENSUEL' | 'ANNUEL' | null = null;
showDatePicker = false;

  benefits = [
    { icon: 'bi-infinity', title: 'Accès illimité', description: 'Utilisez librement tous nos espaces de travail' },
    { icon: 'bi-wifi', title: 'Wi-Fi Haut Débit', description: 'Profitez d\'une connexion rapide et stable partout' },
    { icon: 'bi-cup-hot', title: 'Café & Snacks', description: 'Dégustez boissons chaudes et en-cas à volonté' },
    { icon: 'bi-calendar-event', title: 'Événements exclusifs', description: 'Participez à des rencontres privées entre membres' },
    { icon: 'bi-car-front-fill', title: 'Parking privé', description: 'Accès gratuit à notre parking sécurisé sur place' }
  ];

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
  ) { // Définir les dates min/max pour le calendrier
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

  // Lightbox functionality
  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.lightboxModal?.show();
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
  }

  getSpaceRating(spaceId: number | undefined): string {
    if (!spaceId) return '4.8';
    if (!this.spaceRatings[spaceId]) {
      this.spaceRatings[spaceId] = parseFloat((Math.random() * 0.5 + 4.5).toFixed(1));
    }
    return this.spaceRatings[spaceId].toFixed(1);
  }

  loadEspacesOuverts(): void {
    this.isLoading = true;
    this.espaceService.getAllEspaceOuverts().subscribe({
      next: (espaces) => {
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
          this.galleryImages = [
            'assets/images/open-space1.jpg',
            'assets/images/open-space2.jpg',
            'assets/images/open-space3.jpg'
          ];
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading open spaces:', error);
        this.isLoading = false;
        this.toastr.error('Erreur lors du chargement des espaces ouverts', 'Erreur');
        this.galleryImages = [
          'assets/images/open-space1.jpg',
          'assets/images/open-space2.jpg',
          'assets/images/open-space3.jpg'
        ];
      }
    });
  }

  private async loadUnavailableDates(espaceId: number): Promise<void> {
  try {
    const indisponibilites = await this.indisponibiliteService.getAllIndisponibilites().toPromise();
    const reservations = await this.reservationService.getReservationsBySpace(espaceId).toPromise();
    
    // Process indisponibilites
    this.unavailableDates = indisponibilites
      ?.filter(indispo => indispo.espaceId === espaceId)
      .flatMap(indispo => this.getDatesBetween(new Date(indispo.dateDebut), new Date(indispo.dateFin))) || [];
    
    // Process reservations
    this.reservedDates = reservations
      ?.filter(res => res.espaceId === espaceId)
      .flatMap(res => this.getDatesBetween(new Date(res.dateDebut), new Date(res.dateFin))) || [];
  } catch (error) {
    console.error('Error loading unavailable dates:', error);
  }
}

private getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Add this method to your component
isDateDisabled = (date: NgbDateStruct) => {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (jsDate < today) return true;
  
  // Check if date is in unavailable dates
  const isUnavailable = this.unavailableDates.some(d => 
    d.getFullYear() === date.year && 
    d.getMonth() === date.month - 1 && 
    d.getDate() === date.day
  );
  
  // Check if date is already reserved
  const isReserved = this.reservedDates.some(d => 
    d.getFullYear() === date.year && 
    d.getMonth() === date.month - 1 && 
    d.getDate() === date.day
  );
  
  return isUnavailable || isReserved;
};

  loadAvailableSubscriptions(): void {
    this.abonnementService.getAllAbonnements().subscribe({
      next: (abonnements) => {
        const uniqueSubscriptions = this.getUniqueSubscriptionsByType(abonnements);
        this.availableSubscriptions = uniqueSubscriptions;
        
        if (this.availableSubscriptions.length === 0) {
          this.createDefaultSubscriptions();
        }
      },
      error: (error) => {
        console.error('Error loading subscriptions:', error);
        this.toastr.error('Erreur lors du chargement des abonnements', 'Erreur');
        this.createDefaultSubscriptions();
      }
    });
  }

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
        console.error('Error loading user subscriptions:', error);
        this.isLoading = false;
        this.toastr.error('Erreur lors du chargement de vos abonnements', 'Erreur');
      }
    });
  }

  private getUniqueSubscriptionsByType(abonnements: AbonnementDTO[]): AbonnementDTO[] {
    const uniqueTypes = new Set<string>();
    const result: AbonnementDTO[] = [];
    
    for (const abonnement of abonnements) {
      if (!uniqueTypes.has(abonnement.type)) {
        uniqueTypes.add(abonnement.type);
        result.push(abonnement);
      }
    }
    
    if (!uniqueTypes.has('MENSUEL')) {
      result.push({
        id: 1,
        type: 'MENSUEL',
        prix: 650,
        dateDebut: new Date().toISOString(),
        dateFin: this.calculateEndDate('MENSUEL'),
        userId: 0,
        userEmail: '',
        espaceOuvertId: 0,
        espaceOuvertName: ''
      });
    }
    
    if (!uniqueTypes.has('ANNUEL')) {
      result.push({
        id: 2,
        type: 'ANNUEL',
        prix: 7000,
        dateDebut: new Date().toISOString(),
        dateFin: this.calculateEndDate('ANNUEL'),
        userId: 0,
        userEmail: '',
        espaceOuvertId: 0,
        espaceOuvertName: ''
      });
    }
    
    return result;
  }

  getSubscriptionByType(type: 'MENSUEL' | 'ANNUEL'): AbonnementDTO | undefined {
    return this.availableSubscriptions.find(sub => sub.type === type);
  }

  hasActiveSubscription(): boolean {
    if (!this.authService.isLoggedIn()) return false;
    return this.userSubscriptions.length > 0;
  }

  getActiveSubscriptionType(): string {
    if (!this.hasActiveSubscription()) return '';
    return this.userSubscriptions[0].type === 'MENSUEL' ? 'Mensuel' : 'Annuel';
  }

  private createDefaultSubscriptions(): void {
  const today = new Date();
  this.availableSubscriptions = [
    {
      id: 1,
      type: 'MENSUEL',
      prix: 650,
      dateDebut: today.toISOString(),
      dateFin: this.calculateEndDate('MENSUEL', today),
      userId: 0,
      userEmail: '',
      espaceOuvertId: 0,
      espaceOuvertName: ''
    },
    {
      id: 2,
      type: 'ANNUEL',
      prix: 7000,
      dateDebut: today.toISOString(),
      dateFin: this.calculateEndDate('ANNUEL', today),
      userId: 0,
      userEmail: '',
      espaceOuvertId: 0,
      espaceOuvertName: ''
    }
  ];
}

  subscribeToPlan(planType: 'MENSUEL' | 'ANNUEL'): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Veuillez vous connecter pour souscrire à un abonnement', 'Connexion requise');
      this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
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

    const selectedSubscription = this.availableSubscriptions.find(sub => sub.type === planType);
    if (!selectedSubscription) {
      this.toastr.error('Abonnement non disponible', 'Erreur');
      return;
    }

     const today = new Date();
  const abonnement: AbonnementDTO = {
    type: planType,
    prix: selectedSubscription.prix,
    dateDebut: today.toISOString(),
    dateFin: this.calculateEndDate(planType, today),
    userId: userId,
    userEmail: this.currentUser?.email || '',
    espaceOuvertId: espaceOuvert.id || 0,
    espaceOuvertName: espaceOuvert.name || ''
  };

    

    this.isLoading = true;
    this.abonnementService.createAbonnement(abonnement).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Abonnement créé avec succès', 'Succès');
        this.loadUserSubscriptions();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating subscription:', error);
        this.toastr.error('Erreur lors de la création de l\'abonnement', 'Erreur');
      }
    });
  }

  unsubscribe(): void {
    if (!this.authService.isLoggedIn() || !this.hasActiveSubscription()) {
      return;
    }
    this.unsubscribeModal?.show();
  }

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

    this.isLoading = true;
    this.abonnementService.deleteAbonnement(userSubscription.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Désabonnement effectué avec succès', 'Succès');
        this.loadUserSubscriptions();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error unsubscribing:', error);
        this.toastr.error('Erreur lors du désabonnement', 'Erreur');
      }
    });
  }

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

onDateSelect(date: NgbDateStruct): void {
  this.selectedDate = date;
}

calculateEndDateFromSelected(): Date {
  if (!this.selectedDate || !this.subscriptionType) return new Date();

  const startDate = new Date(
    this.selectedDate.year,
    this.selectedDate.month - 1,
    this.selectedDate.day
  );

  return this.calculateEndDateFromStartDate(startDate, this.subscriptionType);
}

private calculateEndDateFromStartDate(startDate: Date, type: 'MENSUEL' | 'ANNUEL'): Date {
  const endDate = new Date(startDate);
  
  if (type === 'MENSUEL') {
    // Fin du mois
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Dernier jour du mois
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Fin de l'année
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setMonth(11); // Décembre
    endDate.setDate(31); // Dernier jour de l'année
    endDate.setHours(23, 59, 59, 999);
  }
  
  return endDate;
}

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

  private calculateEndDate(planType: 'MENSUEL' | 'ANNUEL', startDate?: Date): string {
  const date = startDate ? new Date(startDate) : new Date();
  
  if (planType === 'MENSUEL') {
    // Fin du mois
    date.setMonth(date.getMonth() + 1);
    date.setDate(0); // Dernier jour du mois
    date.setHours(23, 59, 59, 999);
  } else {
    // Fin de l'année
    date.setFullYear(date.getFullYear() + 1);
    date.setMonth(11); // Décembre
    date.setDate(31); // Dernier jour de l'année
    date.setHours(23, 59, 59, 999);
  }
  
  return date.toISOString();
}

  calculateSubscriptionPrice(): number {
  if (!this.space) return 0;
  
  // Pour les espaces ouverts avec abonnement actif
  if (this.hasActiveSubscription() && this.space.type === 'OUVERT') {
    const activeSub = this.userSubscriptions[0];
    return activeSub?.prix || 0; // Retourne le prix complet de l'abonnement
  }
  
  // Pour les autres cas (espaces privés ou sans abonnement)
  return this.space.prixParJour || 0;
}

async reserveNow(): Promise<void> {
  if (!this.authService.isLoggedIn()) {
    this.toastr.info('Veuillez vous connecter pour effectuer une réservation', 'Connexion requise');
    this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
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
    // Récupérer l'abonnement actif de l'utilisateur
    const userSubs = await this.abonnementService.getAbonnementsByUser(userId).toPromise();
    const activeSubscription = userSubs?.find(sub => 
      new Date(sub.dateFin) > new Date() && sub.userId === userId
    );

    if (!activeSubscription) {
      this.toastr.error('Aucun abonnement actif valide trouvé', 'Erreur');
      return;
    }

    const [indisponibilites, reservations] = await Promise.all([
      this.indisponibiliteService.getAllIndisponibilites().toPromise(),
      this.reservationService.getReservationsBySpace(espace.id).toPromise()
    ]);

    const startDate = new Date(
      this.selectedDate.year,
      this.selectedDate.month - 1,
      this.selectedDate.day
    );
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = this.calculateEndDateFromSelected();
    endDate.setHours(23, 59, 59, 999);

    // Vérifier les indisponibilités
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

    // Vérifier les réservations existantes
    const hasReservationConflict = reservations?.some(reservation => {
      const resStart = new Date(reservation.dateDebut);
      const resEnd = new Date(reservation.dateFin);
      return (startDate < resEnd && endDate > resStart);
    });

    if (hasReservationConflict) {
      this.toastr.error('Cet espace est déjà réservé pour la période sélectionnée', 'Réservation existante');
      return;
    }
    
    

    // Créer la réservation avec le prix de l'abonnement
    this.isLoading = true;
    const reservation: ReservationDTO = {
      userId: userId,
      userFirstName: this.currentUser?.firstName || '',
      userLastName: this.currentUser?.lastName || '',
      userEmail: this.currentUser?.email || '',
      userPhone: this.currentUser?.phone || '',
      espaceId: espace.id,
      espaceName: espace.name,
      espaceType: 'OUVERT',
      dateDebut: startDate.toISOString(),
      dateFin: endDate.toISOString(),
      paiementMontant: activeSubscription.prix, // Use active subscription's price
      statut: 'EN_ATTENTE',
      paiementValide: false,
    };

    this.reservationService.createReservation(reservation).subscribe({
      next: (createdReservation) => {
        this.isLoading = false;
        this.toastr.success('Réservation créée avec succès', 'Succès');
        this.router.navigate(['/spaces']);
        this.resetReservationForm();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating reservation:', error);
        this.toastr.error(error.error?.message || 'Erreur lors de la création de la réservation', 'Erreur');
      }
    });

  } catch (error) {
    this.isLoading = false;
    console.error('Error checking availability:', error);
    this.toastr.error('Erreur lors de la vérification des disponibilités', 'Erreur');
  }
}

resetReservationForm(): void {
  this.selectedDate = null;
  this.subscriptionType = null;
  this.showDatePicker = false;
}
}