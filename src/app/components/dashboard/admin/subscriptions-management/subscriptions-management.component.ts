import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AbonnementDTO, EspaceOuvertDTO, UserDTO } from '../../../../types/entities';
import { AbonnementService } from '../../../../services/abonnement.service';
import { EspaceService } from '../../../../services/espace.service';
import { UserService } from '../../../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-subscriptions-management',
  templateUrl: './subscriptions-management.component.html',
  styleUrls: ['./subscriptions-management.component.css']
})
export class SubscriptionsManagementComponent implements OnInit {
  abonnements: AbonnementDTO[] = [];
  espacesOuverts: EspaceOuvertDTO[] = [];
  users: UserDTO[] = [];
  modalRef?: BsModalRef;
  
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

  constructor(
    private abonnementService: AbonnementService,
    private espaceService: EspaceService,
    private userService: UserService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadAbonnements();
    this.loadEspacesOuverts();
    this.loadUsers();
  }

  loadAbonnements(): void {
    this.abonnementService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements = data;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des abonnements');
      }
    });
  }

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

openEditModal(template: TemplateRef<any>, abonnement: AbonnementDTO): void {
    this.isEditMode = true;
    this.currentAbonnement = { ...abonnement };
    this.modalRef = this.modalService.show(template);
}

  saveAbonnement(): void {
    if (this.isEditMode) {
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
    } else {
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
  }

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

  deleteAbonnement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      this.abonnementService.deleteAbonnement(id).subscribe({
        next: () => {
          this.toastr.success('Abonnement supprimé avec succès');
          this.loadAbonnements();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la suppression de l\'abonnement');
        }
      });
    }
  }

  get filteredAbonnements(): AbonnementDTO[] {
    return this.abonnements.filter(abonnement => {
      const user = this.users.find(u => u.id === abonnement.userId);
      const espace = this.espacesOuverts.find(e => e.id === abonnement.espaceOuvertId);
      
      const userSearch = user ? 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
      const espaceSearch = espace ? 
        espace.name.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
      const typeSearch = abonnement.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return userSearch || espaceSearch || typeSearch;
    });
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Inconnu';
  }

  getEspaceName(espaceId: number): string {
    const espace = this.espacesOuverts.find(e => e.id === espaceId);
    return espace ? espace.name : 'Inconnu';
  }

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
}