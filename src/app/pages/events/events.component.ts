import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementDTO } from '../../types/entities';
import { EvenementService } from '../../services/evenement.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: EvenementDTO[] = [];
  filteredEvents: EvenementDTO[] = [];
  paginatedEvents: EvenementDTO[] = [];
  searchTerm = '';
  isRegisteredFilter = 'all';
  isLoading = true;
  isAuthenticated = false;
  currentUserId: number | null = null;
  currentPage = 1;
  itemsPerPage = 6;
  activeTab = 'my-events'; 

  constructor(
    private eventService: EvenementService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadEvents();
  }

  // Ajouté pour gérer le changement d'onglet
  changeTab(tab: string): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  checkAuthentication(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.currentUserId = this.authService.getCurrentUserId();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvenements().subscribe({
      next: (events) => {
        this.processEvents(events);
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des événements');
        this.isLoading = false;
      }
    });
  }

  processEvents(events: EvenementDTO[]): void {
    this.events = events.map(event => {
      return {
        ...event,
        isRegistered: this.isUserRegistered(event),
        isFull: event.participants.length >= event.maxParticipants,
        availableSpots: event.maxParticipants - event.participants.length
      };
    });
    this.applyFilters();
  }

  isUserRegistered(event: EvenementDTO): boolean {
    if (!this.currentUserId) return false;
    return event.participants.some(p => p.userId === this.currentUserId);
  }

  applyFilters(): void {
    let filtered = [...this.events];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.titre.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term));
    }

    if (this.isAuthenticated && this.isRegisteredFilter !== 'all') {
      filtered = filtered.filter(event => 
        this.isRegisteredFilter === 'registered' 
          ? event.isRegistered 
          : !event.isRegistered
      );
    }

    this.filteredEvents = filtered;
    this.updatePagination();
  }

  // Méthodes de pagination ajoutées
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Méthodes pour formater les dates
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  handleRegistration(eventId: number): void {
    if (!this.currentUserId) {
      this.redirectToLogin();
      return;
    }

    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    if (event.isRegistered) {
      this.cancelRegistration(eventId);
    } else {
      this.registerForEvent(eventId);
    }
  }

  registerForEvent(eventId: number): void {
    if (!this.currentUserId) return;

    this.eventService.registerParticipant(eventId, this.currentUserId).subscribe({
      next: (updatedEvent) => {
        this.updateEventInList(updatedEvent);
        this.toastr.success('Inscription réussie');
      },
      error: (err) => {
        this.toastr.error('Erreur lors de l\'inscription');
      }
    });
  }

  cancelRegistration(eventId: number): void {
    if (!this.currentUserId) return;

    this.eventService.cancelParticipation(eventId, this.currentUserId).subscribe({
      next: (updatedEvent) => {
        this.updateEventInList(updatedEvent);
        this.toastr.success('Inscription annulée');
      },
      error: (err) => {
        this.toastr.error('Erreur lors de l\'annulation');
      }
    });
  }

  private updateEventInList(updatedEvent: EvenementDTO): void {
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = {
        ...updatedEvent,
        isRegistered: updatedEvent.participants.some(p => p.userId === this.currentUserId),
        isFull: updatedEvent.participants.length >= updatedEvent.maxParticipants,
        availableSpots: updatedEvent.maxParticipants - updatedEvent.participants.length
      };
      this.applyFilters();
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
  }

  hasAdminRole(): boolean {
    return this.authService.isAdmin();
  }

  getProgressPercentage(event: EvenementDTO): number {
    if (!event.maxParticipants || event.maxParticipants === 0) return 0;
    const participantsCount = event.participants.length;
    const percentage = (participantsCount / event.maxParticipants) * 100;
    return Math.min(100, Math.round(percentage)); 
  }
}