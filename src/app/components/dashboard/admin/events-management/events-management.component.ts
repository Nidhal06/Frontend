
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EvenementService } from '../../../../services/evenement.service';
import { EspaceService } from '../../../../services/espace.service';
import { EvenementDTO, EspaceDTO, ParticipantDTO } from '../../../../types/entities';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-events-management',
  templateUrl: './events-management.component.html',
  styleUrls: ['./events-management.component.css']
})
export class EventsManagementComponent implements OnInit {
  events: EvenementDTO[] = [];
  espaces: EspaceDTO[] = [];
  isLoading = false;
  isLoadingParticipants = false;
  selectedEvent: EvenementDTO | null = null;
  selectedEventParticipants: ParticipantDTO[] = [];
  selectedEventId: number | null = null;
  eventForm: FormGroup;

  constructor(
    private evenementService: EvenementService,
    private espaceService: EspaceService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
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

  ngOnInit(): void {
    this.loadEvents();
    this.loadEspaces();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.evenementService.getAllEvenements().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des événements');
        this.isLoading = false;
      }
    });
  }

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

  loadEventParticipants(eventId: number): void {
    this.isLoadingParticipants = true;
    this.evenementService.getEvenementById(eventId).subscribe({
      next: (event) => {
        this.selectedEventParticipants = event.participants || [];
        this.isLoadingParticipants = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des participants');
        this.isLoadingParticipants = false;
      }
    });
  }

  openAddModal(modal: TemplateRef<any>): void {
    this.eventForm.reset({
      isActive: true,
      price: 0
    });
    this.modalService.open(modal, { size: 'lg' });
  }

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

  openParticipantsModal(modal: TemplateRef<any>, event: EvenementDTO): void {
    this.selectedEvent = event;
    this.loadEventParticipants(event.id!);
    this.modalService.open(modal, { size: 'lg' });
  }

  openDeleteModal(modal: TemplateRef<any>, event: EvenementDTO): void {
    this.selectedEvent = event;
    this.modalService.open(modal);
  }

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

  toggleEventStatus(event: EvenementDTO): void {
    const updatedEvent = { ...event, isActive: !event.isActive };
    this.evenementService.updateEvenement(event.id!, updatedEvent).subscribe({
      next: () => {
        this.toastr.success('Statut de l\'événement mis à jour');
        this.loadEvents();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour du statut');
      }
    });
  }

  unregisterParticipant(eventId: number, userId: number, index: number): void {
    if (confirm('Êtes-vous sûr de vouloir désinscrire ce participant ?')) {
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
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  getEspaceName(espaceId: number): string {
    const espace = this.espaces.find(e => e.id === espaceId);
    return espace ? espace.name : 'Non spécifié';
  }
}