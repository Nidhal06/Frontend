import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../../services/reservation.service';
import { ReservationDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../services/auth.service';

/**
 * Composant de gestion des réservations
 * Permet de visualiser, filtrer et modifier le statut des réservations
 */
@Component({
  selector: 'app-reservation-management',
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.css'],
  providers: [DatePipe]
})
export class ReservationManagementComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données
  reservations: ReservationDTO[] = [];
  filteredReservations: ReservationDTO[] = [];
  
  // État du composant
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedReservationId: number | null = null;
  
  // Filtres
  statusFilter: string = 'TOUS';
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  /**
   * Constructeur du composant
   * @param toastr Service pour les notifications toast
   * @param reservationService Service pour les opérations CRUD sur les réservations
   * @param authService Service d'authentification
   * @param datePipe Service pour le formatage des dates
   * @param modalService Service pour la gestion des modals
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
   * Charge les réservations au démarrage
   */
  ngOnInit(): void {
    this.loadAllReservations();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge toutes les réservations depuis l'API
   */
  loadAllReservations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.filteredReservations = [...reservations];
        this.totalItems = this.filteredReservations.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des réservations';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // =============================================
  // SECTION: GESTION DES MODALS
  // =============================================

  /**
   * Ouvre la modal d'action pour une réservation
   * @param reservationId L'ID de la réservation
   * @param content Le template de la modal
   */
  openActionModal(reservationId: number, content: any): void {
    this.selectedReservationId = reservationId;
    this.modalService.open(content, { ariaLabelledBy: 'actionModalLabel' });
  }

  // =============================================
  // SECTION: CRUD RÉSERVATIONS
  // =============================================

  /**
   * Met à jour le statut d'une réservation
   * @param newStatus Le nouveau statut ('VALIDEE' ou 'ANNULEE')
   */
  updateReservationStatus(newStatus: 'VALIDEE' | 'ANNULEE'): void {
    if (!this.selectedReservationId) return;

    const reservation = this.reservations.find(r => r.id === this.selectedReservationId);
    if (!reservation) return;

    const updatedReservation = { ...reservation, statut: newStatus };
    
    this.reservationService.updateReservation(this.selectedReservationId, updatedReservation).subscribe({
      next: () => {
        this.toastr.success(`Réservation ${newStatus.toLowerCase()} avec succès`, 'Succès');
        this.modalService.dismissAll();
        this.loadAllReservations();
      },
      error: (err) => {
        this.errorMessage = `Erreur lors de la mise à jour du statut`;
        console.error(err);
        this.modalService.dismissAll();
      }
    });
  }

  /**
   * Supprime une réservation
   */
  deleteReservation(): void {
    if (!this.selectedReservationId) return;

    this.reservationService.deleteReservation(this.selectedReservationId).subscribe({
      next: () => {
        this.toastr.success('Réservation supprimée avec succès', 'Succès');
        this.modalService.dismissAll();
        this.loadAllReservations();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression de la réservation';
        console.error(err);
        this.modalService.dismissAll();
      }
    });
  }

  // =============================================
  // SECTION: PAGINATION ET FILTRAGE
  // =============================================

  /**
   * Gère le changement de page
   * @param event Le numéro de la nouvelle page
   */
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  /**
   * Applique les filtres de statut et de recherche
   */
  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      const statusMatch = this.statusFilter === 'TOUS' || 
                         reservation.statut === this.statusFilter;
      
      const searchMatch = this.searchTerm === '' ||
                         reservation.userFirstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         reservation.userLastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         reservation.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         reservation.espaceName.toLowerCase().includes(this.searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });

    this.totalItems = this.filteredReservations.length;
    this.currentPage = 1;
  }

  /**
   * Retourne les réservations paginées pour l'affichage
   */
  get paginatedReservations(): ReservationDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReservations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne la classe CSS pour le badge de statut
   * @param status Le statut de la réservation
   * @returns La classe CSS correspondante
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'VALIDEE':
        return 'bg-success';
      case 'EN_ATTENTE':
        return 'bg-warning text-dark';
      case 'ANNULEE':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Formate une date pour l'affichage
   * @param date La date à formater
   * @returns La date formatée en string
   */
  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  /**
   * Retourne le minimum entre deux nombres
   * @param a Premier nombre
   * @param b Deuxième nombre
   * @returns Le plus petit des deux nombres
   */
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}