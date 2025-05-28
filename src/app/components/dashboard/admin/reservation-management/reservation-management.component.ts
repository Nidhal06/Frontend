import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../../services/reservation.service';
import { ReservationDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reservation-management',
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.css'],
  providers: [DatePipe]
})
export class ReservationManagementComponent implements OnInit {
  reservations: ReservationDTO[] = [];
  filteredReservations: ReservationDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedReservationId: number | null = null;
  statusFilter: string = 'TOUS';
  searchTerm: string = '';

  constructor(
    private toastr: ToastrService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadAllReservations();
  }

  loadAllReservations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.filteredReservations = [...reservations];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des réservations';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openActionModal(reservationId: number, content: any): void {
    this.selectedReservationId = reservationId;
    this.modalService.open(content, { ariaLabelledBy: 'actionModalLabel' });
  }

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

  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      // Filter by status
      const statusMatch = this.statusFilter === 'TOUS' || 
                         reservation.statut === this.statusFilter;
      
      // Filter by search term (name, email, space)
      const searchMatch = this.searchTerm === '' ||
                         reservation.userFirstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         reservation.userLastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         reservation.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         reservation.espaceName.toLowerCase().includes(this.searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }

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

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }
}