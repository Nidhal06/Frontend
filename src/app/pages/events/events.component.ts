import { Component, OnInit } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventService } from '../../services/event.service';
import { Event } from '../../services/event.model';
import { AuthService } from '../../services/auth.service';
import { TeamInviteDialogComponent } from './team-invite-dialog/team-invite-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  searchTerm = '';
  isRegisteredFilter = 'all';
  activeTab = 'my-events';
  isLoading = true;
  isAuthenticated = false;
  user: any = null;
  currentUserId: number | null = null;
  
  // Propriétés pour la pagination
  currentPage = 1;
  itemsPerPage = 3;
  totalItems = 0;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkAuthStatus(); 
    this.currentUserId = this.authService.getCurrentUser()?.id;
    this.loadEvents();
  }

  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.user = this.authService.getCurrentUser();
    }
  }

  private parseDate(dateString: string): Date {
    if (dateString.includes('T')) {
      return new Date(dateString);
    }
    else if (dateString.includes(' ')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    return new Date(dateString);
  } 

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events.map(event => {
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);
          
          return {
            ...event,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            participants: event.participants || [],
            isRegistered: this.currentUserId 
              ? event.participants.some(p => p.id === this.currentUserId)
              : false,
            registered: event.participants.length
          };
        });
        
        this.filteredEvents = [...this.events]; // Afficher tous les événements
        this.totalItems = this.filteredEvents.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.isLoading = false;
      }
    });
  }
  
  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  applyFilters(): void {
    let results = [...this.events]; // Utiliser tous les événements comme base

    // Filtre par recherche
    if (this.searchTerm) {
      results = results.filter(event => 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par inscription (seulement si authentifié)
    if (this.isAuthenticated && this.isRegisteredFilter !== 'all') {
      results = results.filter(event => 
        this.isRegisteredFilter === 'registered' ? event.isRegistered : !event.isRegistered
      );
    }

    this.filteredEvents = results;
    this.totalItems = this.filteredEvents.length;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.isRegisteredFilter = 'all';
    this.applyFilters();
  }

  formatDate(dateString: string): string {
    return format(parseISO(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  formatTime(dateString: string): string {
    return format(parseISO(dateString), 'HH:mm', { locale: fr });
  }

  // Méthodes pour la pagination
  get paginatedEvents(): Event[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    if (totalPages <= 1) return [];
    
    const pages: number[] = [];
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(totalPages - 1, this.currentPage + 1);
    
    pages.push(1);
    
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  handleRegistration(eventId: number): void {
    if (!this.currentUserId) {
      this.redirectToLogin();
      return;
    }
    
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const action = event.isRegistered 
      ? this.eventService.unregisterFromEvent(eventId, this.currentUserId)
      : this.eventService.registerToEvent(eventId, this.currentUserId);

    action.subscribe({
      next: (updatedEvent) => {
        event.isRegistered = !event.isRegistered;
        event.participants = updatedEvent.participants || [];
        event.registered = event.participants.length;
        
        const message = event.isRegistered 
          ? 'Inscription confirmée!' 
          : 'Désinscription confirmée';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
        
        this.loadEvents();
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.snackBar.open('Une erreur est survenue', 'Fermer', { duration: 3000 });
      }
    });
  }

  openTeamInviteDialog(eventId: number): void {
    const dialogRef = this.dialog.open(TeamInviteDialogComponent, {
      width: '500px',
      data: { eventId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  hasCompanyRole(): boolean {
    return this.authService.hasRole(['ROLE_COMPANY']);
  }

  hasAdminRole(): boolean {
    return this.authService.hasRole(['ROLE_ADMIN']);
  }

  redirectToLogin(): void {
    this.router.navigate(['/signin'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
}