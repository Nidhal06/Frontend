import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementDTO } from '../../types/entities';
import { EvenementService } from '../../services/evenement.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Composant Events - Gestion des événements et inscriptions
 */
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Liste complète des événements
  events: EvenementDTO[] = [];
  
  // Événements filtrés selon les critères de recherche
  filteredEvents: EvenementDTO[] = [];
  
  // Événements paginés pour l'affichage courant
  paginatedEvents: EvenementDTO[] = [];
  
  // Terme de recherche pour filtrer les événements
  searchTerm = '';
  
  // Filtre d'inscription ('all', 'registered', 'not-registered')
  isRegisteredFilter = 'all';
  
  // État de chargement
  isLoading = true;
  
  // Statut d'authentification de l'utilisateur
  isAuthenticated = false;
  
  // ID de l'utilisateur courant
  currentUserId: number | null = null;
  
  // Pagination - page courante
  currentPage = 1;
  
  // Pagination - nombre d'items par page
  itemsPerPage = 6;
  
  // Onglet actif ('my-events' ou autre)
  activeTab = 'my-events';

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private eventService: EvenementService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.checkAuthentication();
    this.loadEvents();
  }

  // =============================================
  // SECTION: GESTION DES ÉVÉNEMENTS
  // =============================================

  /**
   * Charge la liste des événements depuis l'API
   */
  private loadEvents(): void {
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

  /**
   * Traite les événements récupérés pour ajouter des métadonnées
   * @param events Liste des événements à traiter
   */
  private processEvents(events: EvenementDTO[]): void {
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

  /**
   * Vérifie si l'utilisateur courant est inscrit à un événement
   * @param event Événement à vérifier
   * @returns true si l'utilisateur est inscrit
   */
  private isUserRegistered(event: EvenementDTO): boolean {
    if (!this.currentUserId) return false;
    return event.participants.some(p => p.userId === this.currentUserId);
  }

  /**
   * Met à jour un événement dans la liste après modification
   * @param updatedEvent Événement mis à jour
   */
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

  // =============================================
  // SECTION: FILTRES ET RECHERCHE
  // =============================================

  /**
   * Applique les filtres et la recherche sur la liste des événements
   */
  applyFilters(): void {
    let filtered = [...this.events];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.titre.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term));
    }

    // Filtre par statut d'inscription
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

  /**
   * Change l'onglet actif et applique les filtres
   * @param tab Onglet à activer
   */
  changeTab(tab: string): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  // =============================================
  // SECTION: PAGINATION
  // =============================================

  /**
   * Met à jour la liste paginée des événements
   */
  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcule le nombre total de pages
   * @returns Nombre total de pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  /**
   * Génère un tableau des numéros de page
   * @returns Tableau des numéros de page
   */
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  /**
   * Navigue vers une page spécifique
   * @param page Numéro de page
   */
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  /**
   * Navigue vers la page précédente
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * Navigue vers la page suivante
   */
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // =============================================
  // SECTION: GESTION DES INSCRIPTIONS
  // =============================================

  /**
   * Gère l'inscription ou la désinscription à un événement
   * @param eventId ID de l'événement
   */
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

  /**
   * Inscrit l'utilisateur courant à un événement
   * @param eventId ID de l'événement
   */
  private registerForEvent(eventId: number): void {
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

  /**
   * Annule l'inscription de l'utilisateur courant à un événement
   * @param eventId ID de l'événement
   */
  private cancelRegistration(eventId: number): void {
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

  // =============================================
  // SECTION: AUTHENTIFICATION
  // =============================================

  /**
   * Vérifie l'état d'authentification de l'utilisateur
   */
  private checkAuthentication(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.currentUserId = this.authService.getCurrentUserId();
  }

  /**
   * Redirige vers la page de connexion
   */
  public redirectToLogin(): void {
    this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
  }

  /**
   * Vérifie si l'utilisateur a le rôle admin
   * @returns true si l'utilisateur est admin
   */
  hasAdminRole(): boolean {
    return this.authService.isAdmin();
  }

  // =============================================
  // SECTION: UTILITAIRES
  // =============================================

  /**
   * Formate une date au format français
   * @param dateString Date à formater
   * @returns Date formatée
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Formate une heure au format français
   * @param dateString Date contenant l'heure à formater
   * @returns Heure formatée
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Calcule le pourcentage de remplissage d'un événement
   * @param event Événement à analyser
   * @returns Pourcentage de remplissage (0-100)
   */
  getProgressPercentage(event: EvenementDTO): number {
    if (!event.maxParticipants || event.maxParticipants === 0) return 0;
    const participantsCount = event.participants.length;
    const percentage = (participantsCount / event.maxParticipants) * 100;
    return Math.min(100, Math.round(percentage)); 
  }
}