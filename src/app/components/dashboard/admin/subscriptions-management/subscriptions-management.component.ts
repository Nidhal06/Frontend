import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

// Models
import { AbonnementDTO, EspaceOuvertDTO, UserDTO } from '../../../../types/entities';

// Services
import { AbonnementService } from '../../../../services/abonnement.service';
import { EspaceService } from '../../../../services/espace.service';
import { UserService } from '../../../../services/user.service';

/**
 * Composant de gestion des abonnements aux espaces ouverts
 * Permet la création, modification et suppression des abonnements
 */
@Component({
  selector: 'app-subscriptions-management',
  templateUrl: './subscriptions-management.component.html',
  styleUrls: ['./subscriptions-management.component.css']
})
export class SubscriptionsManagementComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Références aux templates
  @ViewChild('deleteConfirmationModal') deleteConfirmationModal!: TemplateRef<any>;

  // Données
  abonnements: AbonnementDTO[] = [];
  espacesOuverts: EspaceOuvertDTO[] = [];
  users: UserDTO[] = [];
  
  // État du composant
  currentAbonnement: AbonnementDTO = {
    type: 'MENSUEL',
    prix: 0,
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    userId: 0,
    userEmail: '',
    espaceOuvertId: 0,
    espaceOuvertName: ''
  };
  isEditMode = false;
  searchTerm = '';
  modalRef?: BsModalRef;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  /**
   * Constructeur du composant
   * @param abonnementService Service pour les opérations CRUD sur les abonnements
   * @param espaceService Service pour la gestion des espaces
   * @param userService Service pour la gestion des utilisateurs
   * @param modalService Service pour la gestion des modals
   * @param toastr Service pour les notifications toast
   */
  constructor(
    private abonnementService: AbonnementService,
    private espaceService: EspaceService,
    private userService: UserService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) { }

  /**
   * Initialisation du composant
   * Charge les données nécessaires
   */
  ngOnInit(): void {
    this.loadAbonnements();
    this.loadEspacesOuverts();
    this.loadUsers();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge la liste des abonnements
   */
  loadAbonnements(): void {
    this.abonnementService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements = data;
        this.totalItems = this.filteredAbonnements.length;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des abonnements');
      }
    });
  }

  /**
   * Charge la liste des espaces ouverts
   */
  loadEspacesOuverts(): void {
    this.espaceService.getAllEspaceOuverts().subscribe({
      next: (data) => {
        this.espacesOuverts = data;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des espaces ouverts');
      }
    });
  }

  /**
   * Charge la liste des utilisateurs
   */
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  // =============================================
  // SECTION: GESTION DES MODALS
  // =============================================

  /**
   * Ouvre la modal d'ajout d'abonnement
   * @param template Le template de la modal
   */
  openAddModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.currentAbonnement = {
      type: 'MENSUEL',
      prix: 0,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      userId: 0,
      userEmail: '',
      espaceOuvertId: 0,
      espaceOuvertName: ''
    };
    this.modalRef = this.modalService.show(template);
  }

  /**
   * Ouvre la modal d'ajout d'abonnement pour tous les coworkers
   * @param template Le template de la modal
   */
  openAddForAllModal(template: TemplateRef<any>): void {
    this.currentAbonnement = {
      type: 'MENSUEL',
      prix: 0,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      userId: 0,
      userEmail: '',
      espaceOuvertId: 0,
      espaceOuvertName: ''
    };
    this.modalRef = this.modalService.show(template);
  }

  /**
   * Ouvre la modal d'édition d'abonnement
   * @param template Le template de la modal
   * @param abonnement L'abonnement à éditer
   */
  openEditModal(template: TemplateRef<any>, abonnement: AbonnementDTO): void {
    this.isEditMode = true;
    this.currentAbonnement = { ...abonnement };
    this.modalRef = this.modalService.show(template);
  }

  // =============================================
  // SECTION: CRUD ABONNEMENTS
  // =============================================

  /**
   * Sauvegarde un abonnement (création ou modification)
   */
  saveAbonnement(): void {
    if (this.isEditMode) {
      this.updateAbonnement();
    } else {
      this.createAbonnement();
    }
  }

  /**
   * Crée un nouvel abonnement
   */
  private createAbonnement(): void {
    this.abonnementService.createAbonnement(this.currentAbonnement).subscribe({
      next: () => {
        this.toastr.success('Abonnement créé avec succès');
        this.loadAbonnements();
        this.modalRef?.hide();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création de l\'abonnement');
      }
    });
  }

  /**
   * Met à jour un abonnement existant
   */
  private updateAbonnement(): void {
    this.abonnementService.updateAbonnement(this.currentAbonnement.id!, this.currentAbonnement).subscribe({
      next: () => {
        this.toastr.success('Abonnement mis à jour avec succès');
        this.loadAbonnements();
        this.modalRef?.hide();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour de l\'abonnement');
      }
    });
  }

  /**
   * Crée des abonnements pour tous les coworkers
   */
  saveAbonnementForAll(): void {
    this.abonnementService.createAbonnementsForAllCoworkers(this.currentAbonnement).subscribe({
      next: () => {
        this.toastr.success('Abonnements créés avec succès pour tous les coworkers');
        this.loadAbonnements();
        this.modalRef?.hide();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création des abonnements');
      }
    });
  }

  /**
   * Ouvre la modal de confirmation de suppression
   * @param id L'ID de l'abonnement à supprimer
   * @param template Le template de la modal
   */
  deleteAbonnement(id: number, template: TemplateRef<any>): void {
    this.currentAbonnement.id = id;
    this.modalRef = this.modalService.show(template);
  }

  /**
   * Confirme et exécute la suppression d'un abonnement
   */
  confirmDelete(): void {
    if (!this.currentAbonnement.id) return;
    
    this.abonnementService.deleteAbonnement(this.currentAbonnement.id).subscribe({
      next: () => {
        this.toastr.success('Abonnement supprimé avec succès');
        this.loadAbonnements();
        this.modalRef?.hide();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la suppression de l\'abonnement');
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
   * Retourne les abonnements filtrés selon la recherche
   */
  get filteredAbonnements(): AbonnementDTO[] {
    const filtered = this.abonnements.filter(abonnement => {
      const user = this.users.find(u => u.id === abonnement.userId);
      const espace = this.espacesOuverts.find(e => e.id === abonnement.espaceOuvertId);
      
      const userSearch = user ? 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
      const espaceSearch = espace ? 
        espace.name.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
      const typeSearch = abonnement.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return userSearch || espaceSearch || typeSearch;
    });

    this.totalItems = filtered.length;
    return filtered;
  }

  /**
   * Retourne les abonnements paginés pour l'affichage
   */
  get paginatedAbonnements(): AbonnementDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAbonnements.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne le nom complet d'un utilisateur
   * @param userId L'ID de l'utilisateur
   * @returns Le nom complet ou 'Inconnu'
   */
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Inconnu';
  }

  /**
   * Retourne le nom d'un espace ouvert
   * @param espaceId L'ID de l'espace
   * @returns Le nom de l'espace ou 'Inconnu'
   */
  getEspaceName(espaceId: number): string {
    const espace = this.espacesOuverts.find(e => e.id === espaceId);
    return espace ? espace.name : 'Inconnu';
  }

  /**
   * Calcule la date de fin en fonction du type d'abonnement
   */
  calculateEndDate(): void {
    if (this.currentAbonnement.dateDebut && this.currentAbonnement.type) {
      const startDate = new Date(this.currentAbonnement.dateDebut);
      const endDate = new Date(startDate);
      
      if (this.currentAbonnement.type === 'MENSUEL') {
        endDate.setMonth(startDate.getMonth() + 1);
      } else {
        endDate.setFullYear(startDate.getFullYear() + 1);
      }
      
      this.currentAbonnement.dateFin = endDate.toISOString().split('T')[0];
    }
  }

  /**
   * Retourne le minimum entre deux nombres
   * @param a Premier nombre
   * @param b Deuxième nombre
   * @returns Le plus petit des deux nombres
   */
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}