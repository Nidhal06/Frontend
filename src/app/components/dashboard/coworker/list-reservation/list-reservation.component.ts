import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../../services/reservation.service';
import { AuthService } from '../../../../services/auth.service';
import { ReservationDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-reservation',
  templateUrl: './list-reservation.component.html',
  styleUrls: ['./list-reservation.component.css'],
  providers: [DatePipe]
})
export class ListReservationComponent implements OnInit {
  reservations: ReservationDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
   selectedReservationId: number | null = null; 

  constructor(
    private toastr: ToastrService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
  const userId = this.authService.getCurrentUserId();
  if (userId) {
    this.reservationService.getReservationsByUser(userId).subscribe({
      next: (reservations) => {
        this.reservations = reservations.map(res => {
          if (res.paiementValide) {
            res.statut = 'VALIDEE';
          } else {
            res.statut = 'EN_ATTENTE';
          }
          return res;
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des réservations';
        this.isLoading = false;
        console.error(err);
      }
    });
  } else {
    this.errorMessage = 'Utilisateur non connecté';
    this.isLoading = false;
  }
}


  openCancelModal(reservationId: number, content: any): void {
    this.selectedReservationId = reservationId;
    this.modalService.open(content, { ariaLabelledBy: 'cancelModalLabel' });
  }

  // Confirme l'annulation
  confirmCancel(): void {
    if (this.selectedReservationId) {
      this.reservationService.deleteReservation(this.selectedReservationId).subscribe({
        next: () => {
          this.modalService.dismissAll(); 
          this.loadReservations(); 
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de l\'annulation de la réservation';
          console.error(err);
          this.modalService.dismissAll(); 
        }
      });
    }
  }

  cancelReservation(reservationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.reservationService.deleteReservation(reservationId).subscribe({
        next: () => {
          this.toastr.success('Réservation annulée avec succès.', 'Succès');
          // Recharger la liste après annulation
          this.loadReservations();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de l\'annulation de la réservation';
          console.error(err);
        }
      });
    }
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