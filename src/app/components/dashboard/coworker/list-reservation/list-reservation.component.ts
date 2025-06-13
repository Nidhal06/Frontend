import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../../services/reservation.service';
import { AuthService } from '../../../../services/auth.service';
import { ReservationDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

/**
 * Composant pour lister et gérer les réservations d'un utilisateur
 */
@Component({
  selector: 'app-list-reservation',
  templateUrl: './list-reservation.component.html',
  styleUrls: ['./list-reservation.component.css'],
  providers: [DatePipe]
})
export class ListReservationComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données
  reservations: ReservationDTO[] = [];
  
  // État du composant
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedReservationId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  /**
   * Constructeur du composant
   * @param toastr Service de notifications
   * @param reservationService Service de gestion des réservations
   * @param authService Service d'authentification
   * @param datePipe Service de formatage des dates
   * @param modalService Service de gestion des modals
   */
  constructor(
    private toastr: ToastrService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {}

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.loadReservations();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge les réservations de l'utilisateur connecté
   */
  loadReservations(): void {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.errorMessage = 'Utilisateur non connecté';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.reservationService.getReservationsByUser(userId).subscribe({
      next: (reservations) => {
        this.reservations = this.mapReservationStatus(reservations);
        this.totalItems = this.reservations.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.handleReservationError(err);
      }
    });
  }

  /**
   * Mappe le statut des réservations en fonction du paiement
   * @param reservations Liste des réservations
   * @returns Liste des réservations avec statut mis à jour
   */
  private mapReservationStatus(reservations: ReservationDTO[]): ReservationDTO[] {
    return reservations.map(res => {
      res.statut = res.paiementValide ? 'VALIDEE' : 'EN_ATTENTE';
      return res;
    });
  }

  /**
   * Gère les erreurs de chargement des réservations
   * @param error Erreur survenue
   */
  private handleReservationError(error: any): void {
    this.errorMessage = 'Erreur lors du chargement des réservations';
    this.isLoading = false;
    console.error(error);
  }

  // =============================================
  // SECTION: PAGINATION
  // =============================================

  /**
   * Gère le changement de page
   * @param event Numéro de la nouvelle page
   */
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  /**
   * Retourne les réservations paginées
   */
  get paginatedReservations(): ReservationDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.reservations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcule l'index de fin des éléments affichés
   */
  getDisplayedEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // =============================================
  // SECTION: GESTION DES RÉSERVATIONS
  // =============================================

  /**
   * Ouvre la modal de confirmation d'annulation
   * @param reservationId ID de la réservation
   * @param content Template de la modal
   */
  openCancelModal(reservationId: number, content: any): void {
    this.selectedReservationId = reservationId;
    this.modalService.open(content, { ariaLabelledBy: 'cancelModalLabel' });
  }

  /**
   * Confirme l'annulation d'une réservation
   */
  confirmCancel(): void {
    if (!this.selectedReservationId) return;

    this.reservationService.deleteReservation(this.selectedReservationId).subscribe({
      next: () => {
        this.handleCancelSuccess();
      },
      error: (err) => {
        this.handleCancelError(err);
      }
    });
  }

  /**
   * Gère la réussite de l'annulation
   */
  private handleCancelSuccess(): void {
    this.modalService.dismissAll();
    this.loadReservations();
    this.toastr.success('Réservation annulée avec succès', 'Succès');
  }

  /**
   * Gère les erreurs d'annulation
   * @param error Erreur survenue
   */
  private handleCancelError(error: any): void {
    this.errorMessage = 'Erreur lors de l\'annulation de la réservation';
    console.error(error);
    this.modalService.dismissAll();
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne la classe CSS pour le badge de statut
   * @param status Statut de la réservation
   * @returns Classe CSS correspondante
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'VALIDEE': return 'bg-success';
      case 'EN_ATTENTE': return 'bg-warning text-dark';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  /**
   * Formate une date pour l'affichage
   * @param date Date à formater
   * @returns Date formatée
   */
  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }
}