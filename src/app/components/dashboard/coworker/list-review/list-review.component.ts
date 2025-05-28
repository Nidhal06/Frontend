import { Component, OnInit } from '@angular/core';
import { AvisService } from '../../../../services/avis.service';
import { AuthService } from '../../../../services/auth.service';
import { AvisDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-review',
  templateUrl: './list-review.component.html',
  styleUrls: ['./list-review.component.css'],
  providers: [DatePipe]
})
export class ListReviewComponent implements OnInit {
  avisList: AvisDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedAvisId: number | null = null;

  constructor(
    private toastr: ToastrService,
    private avisService: AvisService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadUserAvis();
  }

  loadUserAvis(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.avisService.getAllAvis().subscribe({
        next: (avis) => {
          // Filtrer pour ne garder que les avis de l'utilisateur courant
          this.avisList = avis.filter(a => a.userId === userId);
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement des avis';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      this.errorMessage = 'Utilisateur non connecté';
      this.isLoading = false;
    }
  }

  openDeleteModal(avisId: number, content: any): void {
    this.selectedAvisId = avisId;
    this.modalService.open(content, { ariaLabelledBy: 'deleteModalLabel' });
  }

  confirmDelete(): void {
    if (this.selectedAvisId) {
      this.avisService.deleteAvis(this.selectedAvisId).subscribe({
        next: () => {
          this.toastr.success('Avis supprimé avec succès', 'Succès');
          this.modalService.dismissAll();
          this.loadUserAvis();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'avis';
          console.error(err);
          this.modalService.dismissAll();
        }
      });
    }
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
}