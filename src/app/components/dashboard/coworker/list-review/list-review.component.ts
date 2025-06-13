import { Component, OnInit } from '@angular/core';
import { AvisService } from '../../../../services/avis.service';
import { AuthService } from '../../../../services/auth.service';
import { AvisDTO } from '../../../../types/entities';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

/**
 * Composant pour lister et gérer les avis d'un utilisateur
 */
@Component({
  selector: 'app-list-review',
  templateUrl: './list-review.component.html',
  styleUrls: ['./list-review.component.css'],
  providers: [DatePipe]
})
export class ListReviewComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données
  avisList: AvisDTO[] = [];
  
  // État du composant
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedAvisId: number | null = null;
  
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
   * @param avisService Service de gestion des avis
   * @param authService Service d'authentification
   * @param datePipe Service de formatage des dates
   * @param modalService Service de gestion des modals
   */
  constructor(
    private toastr: ToastrService,
    private avisService: AvisService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {}

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.loadUserAvis();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge les avis de l'utilisateur connecté
   */
  loadUserAvis(): void {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.handleUserNotLoggedIn();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.avisService.getAllAvis().subscribe({
      next: (avis) => {
        this.filterAndSetUserAvis(avis, userId);
      },
      error: (err) => {
        this.handleLoadError(err);
      }
    });
  }

  /**
   * Filtre et initialise la liste des avis de l'utilisateur
   * @param avis Liste complète des avis
   * @param userId ID de l'utilisateur connecté
   */
  private filterAndSetUserAvis(avis: AvisDTO[], userId: number): void {
    this.avisList = avis.filter(a => a.userId === userId);
    this.totalItems = this.avisList.length;
    this.isLoading = false;
  }

  /**
   * Gère le cas où l'utilisateur n'est pas connecté
   */
  private handleUserNotLoggedIn(): void {
    this.errorMessage = 'Utilisateur non connecté';
    this.isLoading = false;
  }

  /**
   * Gère les erreurs de chargement des avis
   * @param error Erreur survenue
   */
  private handleLoadError(error: any): void {
    this.errorMessage = 'Erreur lors du chargement des avis';
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
   * Retourne les avis paginés pour l'affichage
   */
  get paginatedAvis(): AvisDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.avisList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Retourne le minimum entre deux nombres
   * @param a Premier nombre
   * @param b Deuxième nombre
   * @returns Le plus petit des deux nombres
   */
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // =============================================
  // SECTION: GESTION DES AVIS
  // =============================================

  /**
   * Ouvre la modal de confirmation de suppression
   * @param avisId ID de l'avis à supprimer
   * @param content Template de la modal
   */
  openDeleteModal(avisId: number, content: any): void {
    this.selectedAvisId = avisId;
    this.modalService.open(content, { ariaLabelledBy: 'deleteModalLabel' });
  }

  /**
   * Confirme et exécute la suppression d'un avis
   */
  confirmDelete(): void {
    if (!this.selectedAvisId) return;

    this.avisService.deleteAvis(this.selectedAvisId).subscribe({
      next: () => {
        this.handleDeleteSuccess();
      },
      error: (err) => {
        this.handleDeleteError(err);
      }
    });
  }

  /**
   * Gère la réussite de la suppression
   */
  private handleDeleteSuccess(): void {
    this.toastr.success('Avis supprimé avec succès', 'Succès');
    this.modalService.dismissAll();
    this.loadUserAvis();
  }

  /**
   * Gère les erreurs de suppression
   * @param error Erreur survenue
   */
  private handleDeleteError(error: any): void {
    this.errorMessage = 'Erreur lors de la suppression de l\'avis';
    console.error(error);
    this.modalService.dismissAll();
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Formate une date pour l'affichage
   * @param date Date à formater
   * @returns Date formatée en string (dd/MM/yyyy)
   */
  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
}