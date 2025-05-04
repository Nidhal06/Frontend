import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/services/event.service';
import { SpaceService } from 'src/app/services/space.service';
import { format, parseISO } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { Event } from 'src/app/services/event.model';
import { PrivateSpace } from 'src/app/services/space.model';

@Component({
  selector: 'app-events-management',
  templateUrl: './events-management.component.html',
  styleUrls: ['./events-management.component.css']
})
export class EventsManagementComponent implements OnInit {
  events: Event[] = [];
  spaces: PrivateSpace[] = [];
  isLoading = false;
  selectedEvent: Event | null = null;
  eventForm: FormGroup;

  constructor(
    private eventService: EventService,
    private spaceService: SpaceService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      maxParticipants: [10, [Validators.required, Validators.min(1)]],
      spaceId: [null, Validators.required],
      price: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadSpaces();

    // Add this to watch for spaceId changes
  this.eventForm.get('spaceId')?.valueChanges.subscribe(spaceId => {
    this.onSpaceChange(spaceId);
  });
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Error loading events');
        this.isLoading = false;
      }
    });
  }

  loadSpaces(): void {
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.spaces = spaces;
      },
      error: (err) => {
        this.toastr.error('Error loading spaces');
      }
    });
  }

  openAddModal(content: TemplateRef<any>): void {
    this.eventForm.reset({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      maxParticipants: 10,
      spaceId: null,
      price: 0,
      isActive: true
    });
    this.selectedEvent = null;
    this.modalService.open(content, { size: 'lg' });
  }

  openEditModal(content: TemplateRef<any>, event: Event): void {
    this.selectedEvent = event;
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      startTime: format(parseISO(event.startTime), 'yyyy-MM-dd\'T\'HH:mm'),
      endTime: format(parseISO(event.endTime), 'yyyy-MM-dd\'T\'HH:mm'),
      maxParticipants: event.maxParticipants,
      spaceId: event.space?.id || event.spaceId,
      price: event.price,
      isActive: event.isActive
    });
    this.modalService.open(content, { size: 'lg' });
  }

  openDeleteModal(content: TemplateRef<any>, event: Event): void {
    this.selectedEvent = event;
    this.modalService.open(content);
  }

  onSpaceChange(spaceId: number): void {
    // Your logic here
  }

  addEvent(): void {
    if (this.eventForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    // Convertir les dates en format ISO sans timezone
    const startTime = new Date(this.eventForm.value.startTime);
    const endTime = new Date(this.eventForm.value.endTime);
  
    // Formater les dates pour le backend
    const formattedStartTime = startTime.toISOString();
    const formattedEndTime = endTime.toISOString();
  
    // Vérifier que endTime est après startTime
    if (endTime <= startTime) {
      this.toastr.error('La date de fin doit être après la date de début');
      return;
    }
  
    const formData = {
      title: this.eventForm.value.title,
      description: this.eventForm.value.description,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      spaceId: this.eventForm.value.spaceId,
      maxParticipants: this.eventForm.value.maxParticipants,
      price: this.eventForm.value.price,
      isActive: this.eventForm.value.isActive
    };
  
    console.log('Données envoyées:', formData); // Pour le débogage
  
    this.eventService.createEvent(formData).subscribe({
      next: () => {
        this.toastr.success('Événement créé avec succès');
        this.modalService.dismissAll();
        this.loadEvents();
      },
      error: (err) => {
        console.error('Erreur détaillée:', err);
        this.toastr.error(`Erreur lors de la création: ${err.error?.message || err.message}`);
      }
    });
  }

  updateEvent(): void {
    if (this.eventForm.invalid || !this.selectedEvent) return;

    const formData = {
      ...this.eventForm.value,
      id: this.selectedEvent.id,
      startTime: new Date(this.eventForm.value.startTime).toISOString(),
      endTime: new Date(this.eventForm.value.endTime).toISOString()
    };

    this.eventService.updateEvent(this.selectedEvent.id, formData).subscribe({
      next: () => {
        this.toastr.success('Event updated successfully');
        this.modalService.dismissAll();
        this.loadEvents();
      },
      error: (err) => {
        this.toastr.error('Error updating event');
      }
    });
  }

  deleteEvent(): void {
    if (!this.selectedEvent) return;

    this.eventService.deleteEvent(this.selectedEvent.id).subscribe({
      next: () => {
        this.toastr.success('Event deleted successfully');
        this.modalService.dismissAll();
        this.loadEvents();
      },
      error: (err) => {
        this.toastr.error('Error deleting event');
      }
    });
  }

  toggleEventStatus(event: Event): void {
    this.eventService.toggleEventStatus(event.id, !event.isActive).subscribe({
      next: () => {
        this.toastr.success('Event status updated');
        this.loadEvents();
      },
      error: (err) => {
        this.toastr.error('Error updating event status');
      }
    });
  }

  formatDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  }
}