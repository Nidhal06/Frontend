import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EspacePriveDTO, AvisDTO, ReservationDTO, UserDTO, IndisponibiliteDTO } from '../../../types/entities';
import { EspaceService } from '../../../services/espace.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { AvisService } from '../../../services/avis.service';
import { IndisponibiliteService } from '../../../services/indisponibilite.service';
import { ToastrService } from 'ngx-toastr';
import { NgbDateStruct, NgbTimeStruct, NgbDate, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../services/user.service';
import { environment } from 'src/app/services/environments/environment';

@Component({
  selector: 'app-space-detail',
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css']
})
export class SpaceDetailComponent implements OnInit {
   environment = environment;
  space: EspacePriveDTO | null = null;
  loading = true;
  error: string | null = null;
  currentUser: UserDTO | null = null;
  indisponibilites: IndisponibiliteDTO[] = [];

  // Booking properties
  selectedDate: NgbDateStruct | null = null;
  selectedStartTime: NgbTimeStruct = { hour: 9, minute: 0, second: 0 };
  selectedEndTime: NgbTimeStruct = { hour: 17, minute: 0, second: 0 };
  bookingInProgress = false;
  bookingSuccess = false;
  bookingError: string = '';
  private userReservations: ReservationDTO[] = [];
  private allReservations: ReservationDTO[] = [];

  // Review properties
  reviews: AvisDTO[] = [];
  newReview: { rating: number, commentaire: string } = { rating: 0, commentaire: '' };
  submittingReview = false;

  // Gallery properties
  activeImageIndex = 0;
  showLightbox = false;

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

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    const spaceId = parseInt(id);
    this.loadSpaceDetails(spaceId);
    this.loadReviews(spaceId);
    this.loadIndisponibilites(spaceId);
    this.loadAllReservationsForSpace(spaceId); // Ajoutez cette ligne
    
    if (this.authService.isLoggedIn() && this.authService.getCurrentUserId()) {
      const userId = this.authService.getCurrentUserId()!;
      this.loadCurrentUser(userId);
      this.loadUserReservations(userId, spaceId);
    }
  } else {
    this.error = 'ID de l\'espace non spécifié';
    this.loading = false;
  }
}
  

  loadSpaceDetails(id: number): void {
  this.loading = true;
  this.espaceService.getEspacePriveById(id).subscribe({
    next: (space) => {
      // Nettoyer l'URL en enlevant le domaine si présent
      let cleanedPhoto = space.photoPrincipal;
      if (cleanedPhoto) {
        // Supprimer http://localhost:1010 s'il est présent
        cleanedPhoto = cleanedPhoto.replace(/^http:\/\/localhost:1010/, '');
        // S'assurer que le chemin commence par /
        if (!cleanedPhoto.startsWith('/')) {
          cleanedPhoto = '/' + cleanedPhoto;
        }
      }

      // Gestion des URLs des images avec l'environnement
      this.space = {
        ...space,
        photoPrincipal: cleanedPhoto
          ? `${environment.apiUrl}${cleanedPhoto}`
          : 'assets/images/default-space.jpg',
        gallery: space.gallery?.map(image => {
          if (image) {
            // Nettoyage des URLs dans la galerie également (optionnel mais recommandé)
            let cleanedImage = image.replace(/^http:\/\/localhost:1010/, '');
            if (!cleanedImage.startsWith('/')) {
              cleanedImage = '/' + cleanedImage;
            }
            return `${environment.apiUrl}${cleanedImage}`;
          } else {
            return 'assets/images/default-gallery.jpg';
          }
        }) || []
      };

      this.loading = false;
    },
    error: (err) => {
      this.error = 'Erreur lors du chargement des détails de l\'espace';
      this.loading = false;
      this.toastr.error(this.error, 'Erreur');
    }
  });
}


  loadReviews(spaceId: number): void {
    this.avisService.getAvisByEspaceId(spaceId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des avis', 'Erreur');
      }
    });
  }

  loadIndisponibilites(spaceId: number): void {
  this.indisponibiliteService.getAllIndisponibilites().subscribe({
    next: (indisponibilites) => {
      // Filtrer par espaceId (laisser les dates en string pour respecter le type)
      this.indisponibilites = indisponibilites
        .filter(i => i.espaceId === spaceId);
    },
    error: (err) => {
      console.error('Error loading indisponibilites:', err);
      this.toastr.error('Erreur lors du chargement des indisponibilités', 'Erreur');
    }
  });
}

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
      console.error('Error loading user:', err);
      this.toastr.error('Erreur lors du chargement des informations utilisateur', 'Erreur');
    }
  });
}

  openImage(index: number): void {
    this.activeImageIndex = index;
    this.showLightbox = true;
  }

  closeLightbox(): void {
    this.showLightbox = false;
  }

  nextImage(): void {
    if (this.space && this.space.gallery) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.space.gallery.length;
    }
  }

  prevImage(): void {
    if (this.space && this.space.gallery) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.space.gallery.length) % this.space.gallery.length;
    }
  }

  calculateEstimatedPrice(): number {
    if (!this.space || !this.selectedDate) return 0;
    
    // Calcul basé sur la durée de réservation (heures)
    const hours = this.calculateDurationInHours();
    const hourlyRate = this.space.prixParJour / 8; // Supposons 8h/jour
    
    return hours * hourlyRate;
  }

  calculateDurationInHours(): number {
    if (!this.selectedStartTime || !this.selectedEndTime) return 0;
    
    const startHours = this.selectedStartTime.hour + this.selectedStartTime.minute / 60;
    const endHours = this.selectedEndTime.hour + this.selectedEndTime.minute / 60;
    
    return Math.max(0, endHours - startHours);
  }

  loadUserReservations(userId: number, spaceId: number): void {
  if (!userId || !spaceId) return;
  
  this.reservationService.getReservationsByUser(userId).subscribe({
    next: (reservations) => {
      // Filtrer par espaceId (laisser les dates en string pour respecter le type)
      this.userReservations = reservations
        .filter(r => r.espaceId === spaceId);
    },
    error: (err) => {
      console.error('Error loading user reservations:', err);
    }
  });
}

getDateCustomClass(date: NgbDateStruct) {
  const state = this.isDateDisabled(date);
  if (state.disabled && state.reason) {
    return {
      [state.reason]: true, // 'indisponible' ou 'reserved'
      'disabled-date': true
    };
  }
  return {};
}

loadAllReservationsForSpace(spaceId: number): void {
  this.reservationService.getReservationsBySpace(spaceId).subscribe({
    next: (reservations: ReservationDTO[]) => {
      this.allReservations = reservations;
    },
    error: (err) => {
      console.error('Error loading all reservations:', err);
    }
  });
}

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


onDateHover(date: NgbDateStruct, tooltip: NgbTooltip): void {
  if (this.isDateDisabled(date).disabled) {
    tooltip.open();
  }
}

isDateDisabledForPicker = (date: NgbDate, current?: { year: number; month: number; }) => {
  const dateStruct = { year: date.year, month: date.month, day: date.day };
  return this.isDateDisabled(dateStruct).disabled;
}

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

  bookSpace(): void {
  if (!this.space || !this.selectedDate || !this.authService.getCurrentUserId()) {
    this.bookingError = 'Veuillez remplir tous les champs requis';
    return;
  }

  this.bookingInProgress = true;
  this.bookingError = '';

  // Créer les dates de début et fin
  const startDate = new Date(
    this.selectedDate.year,
    this.selectedDate.month - 1,
    this.selectedDate.day,
    this.selectedStartTime.hour,
    this.selectedStartTime.minute
  );

  const endDate = new Date(
    this.selectedDate.year,
    this.selectedDate.month - 1,
    this.selectedDate.day,
    this.selectedEndTime.hour,
    this.selectedEndTime.minute
  );

  // Vérifier que l'heure de fin est après l'heure de début
  if (endDate <= startDate) {
    this.bookingError = 'L\'heure de fin doit être après l\'heure de début';
    this.bookingInProgress = false;
    return;
  }

  // Vérifier la disponibilité avec les heures
  if (this.isDateTimeRangeReserved(startDate, endDate)) {
    this.bookingError = 'Cet espace n\'est pas disponible pour la plage horaire sélectionnée';
    this.bookingInProgress = false;
    return;
  }

  // Créer la réservation
  const reservation: ReservationDTO = {
    userId: this.authService.getCurrentUserId()!,
    userFirstName: this.currentUser?.firstName || '',
    userLastName: this.currentUser?.lastName || '',
    userEmail: this.currentUser?.email || '',
    userPhone: this.currentUser?.phone || '',
    espaceId: this.space.id!,
    espaceName: this.space.name,
    espaceType: 'PRIVE',
    dateDebut: startDate.toISOString(),
    dateFin: endDate.toISOString(),
    paiementMontant: this.calculateEstimatedPrice(),
    statut: 'EN_ATTENTE',
    paiementValide: false
  };

  // Envoyer la réservation au serveur
  this.reservationService.createReservation(reservation).subscribe({
    next: (createdReservation) => {
      this.bookingSuccess = true;
      this.bookingInProgress = false;
      this.toastr.success('Réservation effectuée avec succès', 'Succès');
      // Recharger les réservations après une réservation réussie
      this.loadUserReservations(this.authService.getCurrentUserId()!, this.space!.id!);
      this.loadAllReservationsForSpace(this.space!.id!);
    },
    error: (err) => {
      this.bookingError = err.error?.message || 'Erreur lors de la réservation';
      this.bookingInProgress = false;
      this.toastr.error(this.bookingError, 'Erreur');
    }
  });
}

isDateTimeRangeReserved(startDate: Date, endDate: Date): boolean {
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

  submitReview(): void {
    if (!this.space || !this.newReview.rating || !this.newReview.commentaire) {
      this.toastr.warning('Veuillez donner une note et un commentaire', 'Avis incomplet');
      return;
    }

    if (!this.authService.getCurrentUserId() || !this.currentUser) {
      this.toastr.warning('Veuillez vous connecter pour poster un avis', 'Connexion requise');
      return;
    }

    this.submittingReview = true;

    const newAvis: AvisDTO = {
      userId: this.authService.getCurrentUserId()!,
      userUsername: this.currentUser.username,
      userFirstName: this.currentUser.firstName,
      userLastName: this.currentUser.lastName,
      espaceId: this.space.id!,
      espaceName: this.space.name,
      espaceType: this.space.type,
      rating: this.newReview.rating,
      commentaire: this.newReview.commentaire,
      date: new Date()
    };

    this.avisService.createAvis(newAvis).subscribe({
      next: (createdAvis) => {
        this.reviews.unshift(createdAvis);
        this.newReview = { rating: 0, commentaire: '' };
        this.submittingReview = false;
        this.toastr.success('Votre avis a été publié', 'Merci !');
      },
      error: (err) => {
        this.submittingReview = false;
        this.toastr.error('Erreur lors de la publication de votre avis', 'Erreur');
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isCurrentUserAdmin(): boolean {
    return this.authService.isAdmin();
  }

  deleteReview(reviewId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.avisService.deleteAvis(reviewId).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.toastr.success('Avis supprimé avec succès', 'Succès');
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la suppression de l\'avis', 'Erreur');
        }
      });
    }
  }
}