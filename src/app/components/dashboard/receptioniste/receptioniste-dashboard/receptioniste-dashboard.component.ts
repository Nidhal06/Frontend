import { Component, OnInit, HostListener } from '@angular/core';
import { ReservationService } from '../../../../services/reservation.service';
import { PaiementService } from '../../../../services/paiement.service';
import { FactureService } from '../../../../services/facture.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { ReservationDTO, EvenementDTO, PaiementDTO, FactureDTO, AbonnementDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../../../services/environments/environment';
import { EvenementService } from '../../../../services/evenement.service';
import { forkJoin } from 'rxjs';
import { AbonnementService } from '../../../../services/abonnement.service';
import { HttpClient , HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-receptioniste-dashboard',
  templateUrl: './receptioniste-dashboard.component.html',
  styleUrls: ['./receptioniste-dashboard.component.css'],
  providers: [DatePipe]
})
export class ReceptionisteDashboardComponent implements OnInit {
  reservations: ReservationDTO[] = [];
  evenements: EvenementDTO[] = [];
  abonnements: AbonnementDTO[] = [];
  paiements: PaiementDTO[] = [];
  factures: FactureDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedReservationId: number | null = null;
  selectedPaiementId: number | null = null;
  selectedFactureId: number | null = null;
  currentTab: string = 'paiements';
  invoiceEmail: string = '';
  
  // Ajouts pour la navbar
  isOpen = false;
  isLoggedIn = false;
  profileImagePath: string = '';
  environment = environment;
  username = '';
  scrolled = false;

  constructor(
    private toastr: ToastrService,
    private reservationService: ReservationService,
    private evenementService: EvenementService,
    private abonnementService: AbonnementService,
    private paiementService: PaiementService,
    private factureService: FactureService,
    private authService: AuthService,
    private userService: UserService,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadData();
  }

  // Méthodes pour la navbar
  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadCurrentUser();
    }
  }

  loadCurrentUser(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.userId) {
      this.userService.getUserById(currentUser.userId).subscribe({
        next: (user) => {
          this.username = user.username;
          this.profileImagePath = user.profileImagePath || '';
        },
        error: (err) => {
          console.error('Error loading current user:', err);
        }
      });
    }
  }

  handleLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/signin']);
    this.toastr.success('Déconnexion réussie', 'Succès');
  }

  // Méthodes existantes pour la gestion des réservations/paiements/factures
loadData(): void {
  this.isLoading = true;
  this.errorMessage = '';

  // Charger toutes les données en parallèle
  forkJoin({
    paiements: this.paiementService.getAllPaiements(),
    reservations: this.reservationService.getAllReservations(),
    evenements: this.evenementService.getAllEvenements(),
    abonnements: this.abonnementService.getAllAbonnements() 
  }).subscribe({
    next: ({paiements, reservations, evenements, abonnements}) => {
      this.paiements = paiements;
      this.reservations = reservations;
      this.evenements = evenements;
      this.abonnements = abonnements;
      this.loadFactures();
    },
    error: (err) => {
      this.errorMessage = 'Erreur lors du chargement des données';
      this.isLoading = false;
      console.error(err);
    }
  });
}

  loadPaiements(): void {
    this.paiementService.getAllPaiements().subscribe({
      next: (paiements) => {
        this.paiements = paiements;
        this.loadFactures();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des paiements';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadFactures(): void {
    this.factureService.getAllFactures().subscribe({
      next: (factures) => {
        this.factures = factures;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des factures';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openValidationModal(paiementId: number, content: any): void {
    this.selectedPaiementId = paiementId;
    this.modalService.open(content, { ariaLabelledBy: 'validationModalLabel' });
  }

  validatePaiement(): void {
    if (!this.selectedPaiementId) return;

    const paiement = this.paiements.find(p => p.id === this.selectedPaiementId);
    if (!paiement) return;

    const updatedPaiement = { ...paiement, statut: 'VALIDE' as 'VALIDE' };
    
    this.paiementService.updatePaiement(this.selectedPaiementId, updatedPaiement).subscribe({
      next: () => {
        this.toastr.success('Paiement validé avec succès', 'Succès');
        this.modalService.dismissAll();
        this.loadPaiements();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la validation du paiement';
        console.error(err);
        this.modalService.dismissAll();
      }
    });
  }

openSendInvoiceModal(paiementId: number, content: any): void {
  console.log('Tentative d\'envoi de facture pour paiement ID:', paiementId);
  this.selectedPaiementId = paiementId;
  
  const paiement = this.paiements.find(p => p.id === paiementId);
  if (!paiement) {
    console.error('Paiement non trouvé:', paiementId);
    this.toastr.error('Paiement introuvable', 'Erreur');
    return;
  }

  switch(paiement.type) {
    case 'RESERVATION':
      if (!paiement.reservationId) {
        console.error('Paiement de réservation sans reservationId', paiement);
        this.toastr.error('Ce paiement n\'est lié à aucune réservation', 'Erreur');
        return;
      }

      const reservation = this.reservations.find(r => r.id === paiement.reservationId);
      if (!reservation) {
        console.error('Réservation non trouvée pour le paiement', {
          paiementId: paiement.id,
          reservationId: paiement.reservationId,
          reservationsDisponibles: this.reservations.map(r => r.id)
        });
        this.toastr.error('Réservation associée introuvable', 'Erreur');
        return;
      }

      if (!reservation.userEmail) {
        console.error('Email manquant dans la réservation', reservation);
        this.toastr.error('Aucun email associé à cette réservation', 'Erreur');
        return;
      }

      this.invoiceEmail = reservation.userEmail;
      this.toastr.info(`Email du utilisateur utilisé: ${this.invoiceEmail}`, 'Information');
      break;

    case 'ABONNEMENT':
  if (!paiement.abonnementId) {
    console.error('Paiement d\'abonnement sans abonnementId', paiement);
    this.toastr.error('Ce paiement n\'est lié à aucun abonnement', 'Erreur');
    return;
  }

  const abonnement = this.abonnements.find(a => a.id === paiement.abonnementId);
  if (!abonnement) {
    console.error('Abonnement non trouvé pour le paiement', {
      paiementId: paiement.id,
      abonnementId: paiement.abonnementId
    });
    this.toastr.error('Abonnement associé introuvable', 'Erreur');
    return;
  }

  if (!abonnement.userEmail) {
    console.error('Email manquant dans l\'abonnement', abonnement);
    this.toastr.error('Aucun email associé à cet abonnement', 'Erreur');
    return;
  }

  this.invoiceEmail = abonnement.userEmail;
  this.toastr.info(`Email du utilisateur utilisé: ${this.invoiceEmail}`, 'Information');
  break;

    case 'EVENEMENT':
  if (!paiement.evenementId) {
    console.error('Paiement d\'événement sans evenementId', paiement);
    this.toastr.error('Ce paiement n\'est lié à aucun événement', 'Erreur');
    return;
  }

  const evenement = this.evenements.find(e => e.id === paiement.evenementId);
  if (!evenement) {
    console.error('Événement non trouvé pour le paiement', {
      paiementId: paiement.id,
      evenementId: paiement.evenementId
    });
    this.toastr.error('Événement associé introuvable', 'Erreur');
    return;
  }

  // Trouver le participant qui correspond à l'utilisateur du paiement
  const participantAssocie = evenement.participants?.find(p => p.userId === paiement.userId);
  
  if (participantAssocie) {
    this.invoiceEmail = participantAssocie.userEmail;
    this.toastr.info(`Email du participant utilisé: ${this.invoiceEmail}`, 'Information');
  } else if (evenement.participants && evenement.participants.length > 0) {
    // Fallback: utiliser le premier participant si on ne trouve pas de correspondance
    this.invoiceEmail = evenement.participants[0].userEmail;
    this.toastr.warning('Utilisateur exact non trouvé, utilisation du premier participant', 'Attention');
  } else {
    this.invoiceEmail = 'evenement@coworkspace.com';
    this.toastr.warning('Aucun participant trouvé, email par défaut utilisé', 'Attention');
  }
  break;

    default:
      console.error('Type de paiement non géré', paiement);
      this.toastr.error(`Type de paiement non supporté: ${paiement.type}`, 'Erreur');
      return;
  }

  this.modalService.open(content, { ariaLabelledBy: 'sendInvoiceModalLabel' });
}

sendInvoice(): void {
  if (!this.selectedPaiementId) {
    this.toastr.error('Paiement invalide', 'Erreur');
    return;
  }

  const paiement = this.paiements.find(p => p.id === this.selectedPaiementId);
  if (!paiement) {
    this.toastr.error('Paiement introuvable', 'Erreur');
    return;
  }

  // Vérifiez que l'email est bien défini
  if (!this.invoiceEmail) {
    this.toastr.error('Aucun email spécifié pour l\'envoi', 'Erreur');
    return;
  }

  const newFacture: FactureDTO = {
    paiementId: this.selectedPaiementId,
    pdfUrl: `${environment.apiUrl}/api/factures/${this.selectedPaiementId}/pdf`,
    dateEnvoi: new Date().toISOString(),
    emailDestinataire: this.invoiceEmail
  };

  this.factureService.createFacture(newFacture).subscribe({
    next: (createdFacture) => {
      this.toastr.success(`Facture envoyée à ${this.invoiceEmail}`, 'Succès');
      this.loadFactures();
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Erreur lors de l\'envoi de la facture', 'Erreur');
    }
  });
}

  getValidatedPayments(): PaiementDTO[] {
    return this.paiements.filter(p => p.statut === 'VALIDE');
  }

 generateFacture(paiementId: number): void {
  if (!paiementId) {
    this.toastr.error('ID de paiement invalide', 'Erreur');
    return;
  }

  const paiement = this.paiements.find(p => p.id === paiementId);
  if (!paiement) {
    this.toastr.error('Paiement introuvable', 'Erreur');
    return;
  }

  let email = '';
  
  switch(paiement.type) {
    case 'RESERVATION':
      const reservation = this.reservations.find(r => r.id === paiement.reservationId);
      if (!reservation) {
        this.toastr.error('Réservation associée introuvable', 'Erreur');
        return;
      }
      email = reservation.userEmail;
      break;
      
    case 'ABONNEMENT':
  const abonnement = this.abonnements.find(a => a.id === paiement.abonnementId);
  if (!abonnement) {
    this.toastr.error('Abonnement associé introuvable', 'Erreur');
    return;
  }
  email = abonnement.userEmail;
  break;
      
    case 'EVENEMENT':
  const evenement = this.evenements.find(e => e.id === paiement.evenementId);
  if (!evenement) {
    this.toastr.error('Événement associé introuvable', 'Erreur');
    return;
  }
  
  // Trouver le participant correspondant à l'utilisateur du paiement
  const participantAssocie = evenement.participants?.find(p => p.userId === paiement.userId);
  
  if (participantAssocie) {
    email = participantAssocie.userEmail;
  } else if (evenement.participants && evenement.participants.length > 0) {
    email = evenement.participants[0].userEmail;
    this.toastr.warning('Utilisateur exact non trouvé, utilisation du premier participant', 'Attention');
  } else {
    email = 'evenement@coworkspace.com';
    this.toastr.warning('Aucun participant trouvé, email par défaut utilisé', 'Attention');
  }
  break;
      
    default:
      this.toastr.error('Type de paiement non supporté', 'Erreur');
      return;
  }

  this.isLoading = true;

  const newFacture: FactureDTO = {
    paiementId: paiementId,
    pdfUrl: `${environment.apiUrl}/api/factures/${paiementId}/pdf`, 
    dateEnvoi: new Date().toISOString(),
    emailDestinataire: email
  };

  this.factureService.createFacture(newFacture).subscribe({
    next: (createdFacture) => {
      this.toastr.success('Facture générée avec succès', 'Succès');
      this.downloadPdf(createdFacture.id!);
      this.loadFactures();
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Erreur lors de la création de la facture', 'Erreur');
      this.isLoading = false;
    }
  });
}

// Ajoutez cette méthode pour télécharger le PDF
downloadPdf(factureId: number): void {
  const token = this.authService.getToken(); 
  
  if (!token) {
    this.toastr.error('Veuillez vous reconnecter', 'Session expirée');
    this.authService.logout();
    this.router.navigate(['/signin']);
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get(`${environment.apiUrl}/api/factures/${factureId}/pdf`, { 
    headers: headers,
    responseType: 'blob'
  }).subscribe(
    (pdfBlob: Blob) => {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${factureId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    (error) => {
      console.error('Erreur de téléchargement :', error);
      if (error.status === 401) {
        this.toastr.error('Session expirée, veuillez vous reconnecter', 'Erreur');
        this.authService.logout();
        this.router.navigate(['/signin']);
      } else {
        this.toastr.error('Impossible de télécharger la facture', 'Erreur');
      }
    }
  );
}

 getPaymentInfo(paiement: PaiementDTO): string {
  switch(paiement.type) {
    case 'RESERVATION':
      if (!paiement.reservationId) return 'Réservation (ID non spécifié)';
      const reservation = this.reservations.find(r => r.id === paiement.reservationId);
      return reservation 
        ? `#${reservation.id} Réservation - ${reservation.espaceName}` 
        : 'Réservation d\'espace privé (inconnue)';
    
    case 'ABONNEMENT':
      if (!paiement.abonnementId) return 'Abonnement (ID non spécifié)';
      const abonnement = this.abonnements.find(r => r.id === paiement.abonnementId);
      return abonnement 
        ? `#${abonnement .id} Abonnement - ${abonnement.espaceOuvertName}` 
        : 'Réservation sous forme d\'Abonnement  d\'espace ouvert (inconnue)';
    
    case 'EVENEMENT':
      if (!paiement.evenementId) return 'Événement (ID non spécifié)';
      const evenement = this.evenements.find(e => e.id === paiement.evenementId);
      return evenement 
        ? `#${evenement.id} Participation à un événement - ${evenement.espaceName}`
        : 'Événement dans espace privé (inconnu)';
    
    default:
      return `Information de paiement non disponible (type: ${paiement.type})`;
  }
}


  openDeleteModal(id: number, type: string, content: any): void {
    if (type === 'facture') this.selectedFactureId = id;
    if (type === 'paiement') this.selectedPaiementId = id;
    this.modalService.open(content, { ariaLabelledBy: 'deleteModalLabel' });
  }

  deleteFacture(): void {
    if (!this.selectedFactureId) return;

    this.factureService.deleteFacture(this.selectedFactureId).subscribe({
      next: () => {
        this.toastr.success('Facture supprimée avec succès', 'Succès');
        this.modalService.dismissAll();
        this.loadFactures();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression de la facture';
        console.error(err);
        this.modalService.dismissAll();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'VALIDE':
        return 'bg-success';
      case 'EN_ATTENTE':
        return 'bg-warning text-dark';
      case 'ANNULE':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getPendingPayments(): PaiementDTO[] {
    return this.paiements.filter(p => p.statut === 'EN_ATTENTE');
  }

  getUnpaidReservations(): ReservationDTO[] {
    return this.reservations.filter(r => 
      !this.paiements.some(p => 
        p.reservationId === r.id && p.statut === 'VALIDE'
      )
    );
  }

  changeTab(tab: string): void {
    this.currentTab = tab;
  }
}