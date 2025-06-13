import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Services
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

// Environment and Models
import { environment } from '../../../services/environments/environment';
import { UserDTO } from '../../../types/entities';

/**
 * Interface pour les éléments du menu de gestion
 */
interface ManagementMenu {
  title: string;
  icon: string;
  description: string;
  onClick: () => void;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  // =============================================
  // SECTION: ÉTAT DU COMPOSANT
  // =============================================
  
  // État de l'interface
  isOpen = false; // Pour le menu déroulant
  scrolled = false; // Pour la détection de scroll
  isLoading = true; // État de chargement
  activeTab = 'overview'; // Onglet actif
  
  // Authentification
  isLoggedIn = false;
  
  // Données utilisateur
  username = '';
  profileImagePath: string = '';
  userCount = 0;
  activeUserCount = 0;
  users: UserDTO[] = [];
  recentUsers: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  
  // Référence à l'environnement pour le template
  environment = environment;
  
  // Abonnements RxJS à nettoyer
  private profileUpdateSubscription!: Subscription;

  // =============================================
  // SECTION: CONFIGURATION DU MENU
  // =============================================
  
  /**
   * Configuration des éléments du menu de gestion
   * Chaque élément contient:
   * - Un titre
   * - Une icône (classes Bootstrap Icons)
   * - Une description
   * - Une fonction de callback au clic
   */
  managementMenus: ManagementMenu[] = [
    {
      title: 'Gestion des utilisateurs',
      icon: 'bi-people-fill',
      description: 'Gérer les comptes utilisateurs, les rôles et les permissions',
      onClick: () => this.navigateTo('/admin-dashboard/users')
    },
    {
      title: 'Gestion des espaces',
      icon: 'bi-building',
      description: 'Gérer les espaces de travail, les salles et leur disponibilité',
      onClick: () => this.navigateTo('/admin-dashboard/spaces')
    },
    {
      title: 'Réservations & Planning',
      icon: 'bi-calendar-date',
      description: 'Consulter et gérer les réservations actuelles et futures',
      onClick: () => this.navigateTo('/admin-dashboard/reservations')
    },
    {
      title: 'Gestion des événements',
      icon: 'bi-calendar-event',
      description: 'Créer et gérer des événements',
      onClick: () => this.navigateTo('/admin-dashboard/events')
    },
    {
      title: 'Gestion des abonnements',
      icon: 'bi-credit-card',
      description: 'Gérer les offres d\'abonnement',
      onClick: () => this.navigateTo('/admin-dashboard/subscriptions')
    },
    {
      title: 'Périodes d\'indisponibilité',
      icon: 'bi-calendar-x',
      description: 'Gérer les périodes où les espaces sont indisponibles',
      onClick: () => this.navigateTo('/admin-dashboard/blackout-periods')
    }
  ];

  // =============================================
  // SECTION: CONSTRUCTEUR ET LIFECYCLE HOOKS
  // =============================================

  constructor(
    public router: Router,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Nettoyage avant destruction du composant
   */
  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  // =============================================
  // SECTION: ÉVÉNEMENTS ET MÉTHODES PUBLIQUES
  // =============================================

  /**
   * Écouteur d'événement pour le scroll de la fenêtre
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  /**
   * Bascule l'état d'ouverture du menu
   */
  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Gère la déconnexion de l'utilisateur
   */
  handleLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.navigateTo('/signin');
    this.showToast('Déconnexion réussie', 'Succès');
  }

  /**
   * Change l'onglet actif
   * @param tab - L'identifiant du nouvel onglet actif
   */
  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Bascule le statut activé/désactivé d'un utilisateur
   * @param user - L'utilisateur à modifier
   */
  toggleUserStatus(user: UserDTO): void {
    if (user.id) {
      this.userService.toggleUserStatus(user.id).subscribe({
        next: (updatedUser) => this.handleUserStatusUpdate(updatedUser, user.id),
        error: () => this.showToast('Erreur lors de la mise à jour du statut', 'Erreur')
      });
    }
  }

  /**
   * Supprime un utilisateur après confirmation
   * @param userId - L'ID de l'utilisateur à supprimer
   */
  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => this.handleUserDeletion(userId),
        error: () => this.showToast('Erreur lors de la suppression de l\'utilisateur', 'Erreur')
      });
    }
  }

  /**
   * Filtre les utilisateurs selon un terme de recherche
   * @param searchTerm - Le terme de recherche
   */
  filterUsers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term)
    );
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES (PUBLIQUES)
  // =============================================

  /**
   * Retourne l'icône correspondant à une tendance
   * @param trend - La tendance ('up', 'down' ou 'neutral')
   * @returns Le nom de l'icône Material
   */
  getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'remove';
    }
  }

  /**
   * Retourne la classe CSS correspondant à une tendance
   * @param trend - La tendance ('up', 'down' ou 'neutral')
   * @returns La classe CSS pour la couleur
   */
  getTrendColor(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  }

  // =============================================
  // SECTION: MÉTHODES PRIVÉES
  // =============================================

  /**
   * Initialise le composant
   */
  private initializeComponent(): void {
    this.checkAuthStatus();
    this.loadRecentUsers();
    this.loadUserStats();
  }

  /**
   * Nettoie les abonnements RxJS
   */
  private cleanupSubscriptions(): void {
    if (this.profileUpdateSubscription) {
      this.profileUpdateSubscription.unsubscribe();
    }
  }

  /**
   * Vérifie le statut d'authentification
   */
  private checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadCurrentUser();
    }
  }

  /**
   * Charge les données de l'utilisateur courant
   */
  private loadCurrentUser(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.userId) {
      this.userService.getUserById(currentUser.userId).subscribe({
        next: (user) => {
          this.username = user.username;
          this.profileImagePath = user.profileImagePath || '';
        },
        error: (err) => console.error('Error loading current user:', err)
      });
    }
  }

  /**
   * Charge les utilisateurs récents
   */
  private loadRecentUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: UserDTO[]) => {
        this.users = users;
        this.userCount = users.length;
        this.activeUserCount = users.filter(u => u.enabled).length;
        this.prepareRecentUsers();
        this.isLoading = false;
      },
      error: (err) => console.error('Erreur lors du chargement des utilisateurs', err)
    });
  }

  /**
   * Prépare la liste des utilisateurs récents pour l'affichage
   */
  private prepareRecentUsers(): void {
    this.recentUsers = this.users
      .sort((a, b) => (b.id || 0) - (a.id || 0)) // Trie par ID décroissant
      .slice(0, 5) // Prend les 5 premiers
      .map(user => ({
        ...user,
        // Construit l'URL complète de l'image de profil
        profileImagePath: user.profileImagePath 
          ? `${environment.apiUrl}${user.profileImagePath}`
          : ''
      }));
  }

  /**
   * Charge les statistiques utilisateurs
   */
  private loadUserStats(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.userCount = users.length;
        this.activeUserCount = users.filter(user => user.enabled).length;
      },
      error: (err) => console.error('Error loading user stats:', err)
    });
  }

  /**
   * Gère la mise à jour du statut d'un utilisateur
   * @param updatedUser - L'utilisateur mis à jour
   * @param userId - L'ID de l'utilisateur
   */
  private handleUserStatusUpdate(updatedUser: UserDTO, userId?: number): void {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = updatedUser;
    }
    this.showToast('Statut utilisateur mis à jour', 'Succès');
    this.loadUserStats();
  }

  /**
   * Gère la suppression d'un utilisateur
   * @param userId - L'ID de l'utilisateur supprimé
   */
  private handleUserDeletion(userId: number): void {
    this.users = this.users.filter(user => user.id !== userId);
    this.showToast('Utilisateur supprimé avec succès', 'Succès');
    this.loadUserStats();
  }

  /**
   * Navigue vers une route
   * @param route - La route destination
   */
  private navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Affiche une notification toast
   * @param message - Le message à afficher
   * @param title - Le titre de la notification
   */
  private showToast(message: string, title: string): void {
    this.toastr.success(message, title);
  }
}