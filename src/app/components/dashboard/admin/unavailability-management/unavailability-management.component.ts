import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

// Services
import { IndisponibiliteService } from '../../../../services/indisponibilite.service';
import { EspaceService } from '../../../../services/espace.service';

// Models
import { EspaceDTO, IndisponibiliteDTO } from '../../../../types/entities';

// Pipes
import { FilterPipe } from './filter.pipe';

@Component({
  selector: 'app-unavailability-management',
  templateUrl: './unavailability-management.component.html',
  styleUrls: ['./unavailability-management.component.css'],
  providers: [FilterPipe]
})
export class UnavailabilityManagementComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données
  indisponibilites: IndisponibiliteDTO[] = [];
  espaces: EspaceDTO[] = [];
  currentIndisponibilite: IndisponibiliteDTO | null = null;
  
  // État du composant
  loading = false;
  isEditMode = false;
  searchText = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  // Formulaire
  indispoForm: FormGroup;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private indisponibiliteService: IndisponibiliteService,
    private espaceService: EspaceService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    // Initialisation du formulaire
    this.indispoForm = this.fb.group({
      espaceId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      raison: ['', Validators.required]
    });
  }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.loadIndisponibilites();
    this.loadEspaces();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge la liste des indisponibilités depuis l'API
   */
  loadIndisponibilites(): void {
    this.loading = true;
    this.indisponibiliteService.getAllIndisponibilites().subscribe({
      next: (data) => {
        this.indisponibilites = data;
        this.totalItems = this.indisponibilites.length;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des indisponibilités');
        this.loading = false;
      }
    });
  }

  /**
   * Charge la liste des espaces depuis l'API
   */
  loadEspaces(): void {
    this.espaceService.getAllEspaces().subscribe({
      next: (data) => {
        this.espaces = data;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des espaces');
      }
    });
  }

  // =============================================
  // SECTION: PAGINATION ET FILTRAGE
  // =============================================

  /**
   * Gère le changement de page
   * @param event - Le numéro de la nouvelle page
   */
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  /**
   * Retourne le minimum entre deux nombres
   * @param a - Premier nombre
   * @param b - Deuxième nombre
   */
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  /**
   * Retourne les indisponibilités filtrées selon la recherche
   */
  get filteredIndisponibilites(): IndisponibiliteDTO[] {
    if (!this.searchText) {
      return this.indisponibilites;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.indisponibilites.filter(indispo => 
      this.getEspaceName(indispo.espaceId).toLowerCase().includes(searchTextLower) ||
      indispo.raison.toLowerCase().includes(searchTextLower) ||
      indispo.dateDebut.toLowerCase().includes(searchTextLower) ||
      indispo.dateFin.toLowerCase().includes(searchTextLower)
    );
  }

  /**
   * Retourne les indisponibilités paginées pour l'affichage
   */
  get paginatedIndisponibilites(): IndisponibiliteDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredIndisponibilites.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // =============================================
  // SECTION: GESTION DES MODALS
  // =============================================

  /**
   * Ouvre la modal de création
   * @param content - Le template de la modal
   */
  openCreateModal(content: any): void {
    this.isEditMode = false;
    this.indispoForm.reset();
    this.modalService.open(content, { 
      size: 'lg', 
      centered: true 
    });
  }

  /**
   * Ouvre la modal d'édition
   * @param content - Le template de la modal
   * @param indispo - L'indisponibilité à éditer
   */
  openEditModal(content: any, indispo: IndisponibiliteDTO): void {
    this.isEditMode = true;
    this.currentIndisponibilite = indispo;
    
    this.indispoForm.patchValue({
      espaceId: indispo.espaceId,
      dateDebut: this.formatDateForInput(indispo.dateDebut),
      dateFin: this.formatDateForInput(indispo.dateFin),
      raison: indispo.raison
    });
    
    this.modalService.open(content, { 
      size: 'lg', 
      centered: true 
    });
  }

  /**
   * Formate une date pour l'input datetime-local
   * @param dateString - La date à formater
   */
  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  /**
   * Ouvre la modal de confirmation de suppression
   * @param modal - Le template de la modal
   * @param currentIndisponibilite - L'indisponibilité à supprimer
   */
  openDeleteModal(modal: TemplateRef<any>, currentIndisponibilite: IndisponibiliteDTO): void {
    this.currentIndisponibilite = currentIndisponibilite;
    this.modalService.open(modal);
  }

  // =============================================
  // SECTION: CRUD INDISPONIBILITÉS
  // =============================================

  /**
   * Soumission du formulaire (création ou édition)
   */
  onSubmit(): void {
    if (this.indispoForm.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formValue = this.indispoForm.value;
    const espace = this.espaces.find(e => e.id === formValue.espaceId);
    const indispoData: IndisponibiliteDTO = {
      espaceId: formValue.espaceId,
      espaceName: espace ? espace.name : 'Espace inconnu',
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin,
      raison: formValue.raison
    };

    if (this.isEditMode && this.currentIndisponibilite?.id) {
      this.updateIndisponibilite(this.currentIndisponibilite.id, indispoData);
    } else {
      this.createIndisponibilite(indispoData);
    }
  }

  /**
   * Crée une nouvelle indisponibilité
   * @param indispo - Les données de l'indisponibilité à créer
   */
  createIndisponibilite(indispo: IndisponibiliteDTO): void {
    this.indisponibiliteService.createIndisponibilite(indispo).subscribe({
      next: (data) => {
        this.toastr.success('Indisponibilité créée avec succès');
        this.loadIndisponibilites();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création de l\'indisponibilité');
      }
    });
  }

  /**
   * Met à jour une indisponibilité existante
   * @param id - L'ID de l'indisponibilité à mettre à jour
   * @param indispo - Les nouvelles données
   */
  updateIndisponibilite(id: number, indispo: IndisponibiliteDTO): void {
    const updateData = {
      ...indispo,
      id: id 
    };
    
    this.indisponibiliteService.updateIndisponibilite(id, updateData).subscribe({
      next: (data) => {
        this.toastr.success('Indisponibilité mise à jour avec succès');
        this.loadIndisponibilites();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour de l\'indisponibilité');
      }
    });
  }

  /**
   * Supprime une indisponibilité
   */
  deleteIndisponibilite(): void {
    if (!this.currentIndisponibilite) return;

    this.indisponibiliteService.deleteIndisponibilite(this.currentIndisponibilite.id!).subscribe({
      next: () => {
        this.toastr.success('Indisponibilité supprimée avec succès');
        this.loadIndisponibilites();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la suppression de l\'indisponibilité');
      }
    });
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne le nom d'un espace à partir de son ID
   * @param espaceId - L'ID de l'espace
   */
  getEspaceName(espaceId: number): string {
    const espace = this.espaces.find(e => e.id === espaceId);
    return espace ? espace.name : 'Espace inconnu';
  }
}

