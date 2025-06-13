import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EvenementService } from '../../../../services/evenement.service';
import { EspaceService } from '../../../../services/espace.service';
import { EvenementDTO, EspaceDTO, ParticipantDTO } from '../../../../types/entities';
import { ToastrService } from 'ngx-toastr';

/**
 * Composant de gestion des événements
 * Permet la création, modification, suppression et gestion des participants aux événements
 */
@Component({
  selector: 'app-events-management',
  templateUrl: './events-management.component.html',
  styleUrls: ['./events-management.component.css']
})
export class EventsManagementComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données
  events: EvenementDTO[] = [];
  espaces: EspaceDTO[] = [];
  selectedEvent: EvenementDTO | null = null;
  selectedEventParticipants: ParticipantDTO[] = [];
  
  // État du composant
  isLoading = false;
  isLoadingParticipants = false;
  selectedEventId: number | null = null;
  
  // Pagination événements
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  // Pagination participants
  currentParticipantsPage = 1;
  participantsPerPage = 5;
  totalParticipants = 0;

  // Formulaire
  eventForm: FormGroup;

  // Gestion des participants
  private participantToUnregister: {eventId: number, userId: number, index: number} | null = null;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  /**
   * Constructeur du composant
   * @param evenementService Service pour les opérations CRUD sur les événements
   * @param espaceService Service pour la gestion des espaces
   * @param fb Service pour la construction de formulaires
   * @param modalService Service pour la gestion des modals
   * @param toastr Service pour les notifications toast
   */
  constructor(
    private evenementService: EvenementService,
    private espaceService: EspaceService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    // Initialisation du formulaire
    this.eventForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      espaceId: ['', Validators.required],
      maxParticipants: ['', [Validators.required, Validators.min(1)]],
      price: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  /**
   * Initialisation du composant
   * Charge les événements et les espaces disponibles
   */
  ngOnInit(): void {
    this.loadEvents();
    this.loadEspaces();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge la liste des événements
   */
  loadEvents(): void {
    this.isLoading = true;
    this.evenementService.getAllEvenements().subscribe({
      next: (events) => {
        this.events = events;
        this.totalItems = events.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des événements');
        this.isLoading = false;
      }
    });
  }

  /**
   * Charge la liste des espaces disponibles
   */
  loadEspaces(): void {
    this.espaceService.getAllEspaces().subscribe({
      next: (espaces) => {
        this.espaces = espaces;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des espaces');
      }
    });
  }

  /**
   * Charge les participants d'un événement spécifique
   * @param eventId L'ID de l'événement
   */
  loadEventParticipants(eventId: number): void {
    this.isLoadingParticipants = true;
    this.evenementService.getEvenementById(eventId).subscribe({
      next: (event) => {
        this.selectedEventParticipants = event.participants || [];
        this.totalParticipants = this.selectedEventParticipants.length;
        this.currentParticipantsPage = 1;
        this.isLoadingParticipants = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des participants');
        this.isLoadingParticipants = false;
      }
    });
  }

  // =============================================
  // SECTION: PAGINATION
  // =============================================

  /**
   * Gère le changement de page pour les événements
   * @param event Le numéro de la nouvelle page
   */
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  /**
   * Gère le changement de page pour les participants
   * @param event Le numéro de la nouvelle page
   */
  participantsPageChanged(event: number): void {
    this.currentParticipantsPage = event;
  }

  /**
   * Retourne les événements paginés
   */
  get paginatedEvents(): EvenementDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Retourne les participants paginés
   */
  get paginatedParticipants(): ParticipantDTO[] {
    const startIndex = (this.currentParticipantsPage - 1) * this.participantsPerPage;
    return this.selectedEventParticipants.slice(startIndex, startIndex + this.participantsPerPage);
  }

  // =============================================
  // SECTION: GESTION DES MODALS
  // =============================================

  /**
   * Ouvre la modal d'ajout d'événement
   * @param modal Le template de la modal
   */
  openAddModal(modal: TemplateRef<any>): void {
    this.eventForm.reset({
      isActive: true,
      price: 0
    });
    this.modalService.open(modal, { size: 'lg' });
  }

  /**
   * Ouvre la modal d'édition d'événement
   * @param modal Le template de la modal
   * @param event L'événement à éditer
   */
  openEditModal(modal: TemplateRef<any>, event: EvenementDTO): void {
    this.selectedEvent = event;
    this.eventForm.patchValue({
      titre: event.titre,
      description: event.description,
      startDate: this.formatDateForInput(event.startDate),
      endDate: this.formatDateForInput(event.endDate),
      espaceId: event.espaceId,
      maxParticipants: event.maxParticipants,
      price: event.price,
      isActive: event.isActive
    });
    this.modalService.open(modal, { size: 'lg' });
  }

  /**
   * Ouvre la modal de visualisation des participants
   * @param modal Le template de la modal
   * @param event L'événement dont on veut voir les participants
   */
  openParticipantsModal(modal: TemplateRef<any>, event: EvenementDTO): void {
    this.selectedEvent = event;
    this.loadEventParticipants(event.id!);
    this.modalService.open(modal, { size: 'lg' });
  }

  /**
   * Ouvre la modal de confirmation de suppression
   * @param modal Le template de la modal
   * @param event L'événement à supprimer
   */
  openDeleteModal(modal: TemplateRef<any>, event: EvenementDTO): void {
    this.selectedEvent = event;
    this.modalService.open(modal);
  }

  /**
   * Ouvre la modal de confirmation de désinscription
   * @param modal Le template de la modal
   * @param eventId L'ID de l'événement
   * @param userId L'ID de l'utilisateur
   * @param index L'index du participant dans la liste
   */
  openUnregisterModal(modal: TemplateRef<any>, eventId: number, userId: number, index: number): void {
    this.participantToUnregister = {eventId, userId, index};
    this.modalService.open(modal);
  }

  // =============================================
  // SECTION: CRUD ÉVÉNEMENTS
  // =============================================

  /**
   * Crée un nouvel événement
   */
  addEvent(): void {
    if (this.eventForm.invalid) return;

    const formValue = this.eventForm.value;
    const newEvent: EvenementDTO = {
      titre: formValue.titre,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      espaceId: formValue.espaceId,
      maxParticipants: formValue.maxParticipants,
      price: formValue.price,
      isActive: formValue.isActive,
      participants: [],
      espaceName: this.getEspaceName(formValue.espaceId)
    };

    this.evenementService.createEvenement(newEvent).subscribe({
      next: () => {
        this.toastr.success('Événement créé avec succès');
        this.loadEvents();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création de l\'événement');
      }
    });
  }

  /**
   * Met à jour un événement existant
   */
  updateEvent(): void {
    if (this.eventForm.invalid || !this.selectedEvent) return;

    const formValue = this.eventForm.value;
    const updatedEvent: EvenementDTO = {
      ...this.selectedEvent,
      titre: formValue.titre,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      espaceId: formValue.espaceId,
      maxParticipants: formValue.maxParticipants,
      price: formValue.price,
      isActive: formValue.isActive
    };

    this.evenementService.updateEvenement(this.selectedEvent.id!, updatedEvent).subscribe({
      next: () => {
        this.toastr.success('Événement mis à jour avec succès');
        this.loadEvents();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour de l\'événement');
      }
    });
  }

  /**
   * Supprime un événement
   */
  deleteEvent(): void {
    if (!this.selectedEvent) return;

    this.evenementService.deleteEvenement(this.selectedEvent.id!).subscribe({
      next: () => {
        this.toastr.success('Événement supprimé avec succès');
        this.loadEvents();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la suppression de l\'événement');
      }
    });
  }

  /**
   * Bascule le statut actif/inactif d'un événement
   * @param event L'événement à modifier
   */
 toggleEventStatus(event: EvenementDTO): void {
    const updatedEvent = { 
        ...event, 
        isActive: !event.isActive
    };

    console.log('Updating event with:', updatedEvent); // Debug
    
    this.evenementService.updateEvenement(event.id!, updatedEvent).subscribe({
        next: (updated) => {
            console.log('Update response:', updated); // Debug
            this.toastr.success('Statut mis à jour');
            
            // Mise à jour locale immédiate
            const index = this.events.findIndex(e => e.id === event.id);
            if (index !== -1) {
                this.events[index].isActive = updated.isActive;
            }
        },
        error: (err) => {
            console.error('Update error:', err);
            this.toastr.error('Échec de la mise à jour');
        }
    });
 }

  /**
   * Confirme la désinscription d'un participant
   */
  confirmUnregister(): void {
    if (!this.participantToUnregister) return;

    const {eventId, userId, index} = this.participantToUnregister;
    this.evenementService.cancelParticipation(eventId, userId).subscribe({
      next: () => {
        this.toastr.success('Participant désinscrit avec succès');
        this.selectedEventParticipants.splice(index, 1);
        this.loadEvents();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la désinscription du participant');
      }
    });
    this.participantToUnregister = null;
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Formate une date pour l'input datetime-local
   * @param dateString La date à formater
   * @returns La date formatée
   */
  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  /**
   * Retourne le nom d'un espace à partir de son ID
   * @param espaceId L'ID de l'espace
   * @returns Le nom de l'espace ou 'Non spécifié'
   */
  getEspaceName(espaceId: number): string {
    const espace = this.espaces.find(e => e.id === espaceId);
    return espace ? espace.name : 'Non spécifié';
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
}