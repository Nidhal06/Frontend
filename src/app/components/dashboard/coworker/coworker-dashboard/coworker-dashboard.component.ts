import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../services/environments/environment';
import { Subscription } from 'rxjs';
import { UserDTO } from '../../../../types/entities';
import { ToastrService } from 'ngx-toastr';

interface ManagementMenu {
  title: string;
  icon: string;
  description: string;
  onClick: () => void;
}

/**
 * Composant Dashboard pour les coworkers
 * Fournit une interface de gestion des espaces, réservations et événements
 */
@Component({
  selector: 'app-coworker-dashboard',
  templateUrl: './coworker-dashboard.component.html',
  styleUrls: ['./coworker-dashboard.component.css']
})
export class CoworkerDashboardComponent implements OnInit, OnDestroy {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // État de l'interface
  isOpen = false;
  scrolled = false;
  activeTab = 'overview';
  isLoading = true;
  
  // Authentification
  isLoggedIn = false;
  username = '';
  profileImagePath: string = '';
  
  // Configuration
  environment = environment;
  
  // Données
  users: UserDTO[] = [];
  
  // Menu de navigation
  managementMenus: ManagementMenu[] = [
    {
      title: 'Trouver un espace',
      icon: 'bi-geo-alt-fill',
      description: 'Parcourez nos espaces disponibles',
      onClick: () => this.router.navigate(['/coworker-dashboard/check-spaces'])
    },
    {
      title: 'Événements à venir',
      icon: 'bi-calendar-event-fill',
      description: 'Découvrez nos événements et ateliers',
      onClick: () => this.router.navigate(['/coworker-dashboard/check-events'])
    },
    {
      title: 'Mes réservations',
      icon: 'bi-calendar-date',
      description: 'Consultez vos réservations passées et à venir',
      onClick: () => this.router.navigate(['/coworker-dashboard/my-bookings'])
    },
    {
      title: 'Mes avis',
      icon: 'bi-chat-dots-fill', 
      description: 'Consultez vos avis soumis pour les espaces privés',
      onClick: () => this.router.navigate(['/coworker-dashboard/my-feedbacks'])
    },
  ];

  // Abonnements
  private profileUpdateSubscription!: Subscription;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  /**
   * Constructeur du composant
   * @param router Service de navigation
   * @param userService Service de gestion des utilisateurs
   * @param authService Service d'authentification
   * @param toastr Service de notifications
   */
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
    this.checkAuthStatus();
  }

  /**
   * Nettoyage lors de la destruction du composant
   */
  ngOnDestroy(): void {
    if (this.profileUpdateSubscription) {
      this.profileUpdateSubscription.unsubscribe();
    }
  }

  // =============================================
  // SECTION: GESTION DE L'INTERFACE
  // =============================================

  /**
   * Basculer l'état du menu
   */
  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Écouteur d'événement de scroll
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  /**
   * Change l'onglet actif
   * @param tab Le nom de l'onglet à activer
   */
  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  // =============================================
  // SECTION: GESTION DE L'AUTHENTIFICATION
  // =============================================

  /**
   * Vérifie l'état d'authentification
   */
  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadCurrentUser();
    }
  }

  /**
   * Charge les informations de l'utilisateur courant
   */
  loadCurrentUser(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.userId) {
      this.userService.getUserById(currentUser.userId).subscribe({
        next: (user) => {
          this.username = user.username;
          this.profileImagePath = user.profileImagePath || '';
        },
        error: (err) => {
          console.error('Error loading current user:', err);
        }
      });
    }
  }

  /**
   * Gère la déconnexion de l'utilisateur
   */
  handleLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/signin']);
    this.toastr.success('Déconnexion réussie', 'Succès');
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne l'icône correspondant à une tendance
   * @param trend La tendance ('up', 'down' ou 'neutral')
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
   * @param trend La tendance ('up', 'down' ou 'neutral')
   * @returns La classe CSS pour le style de couleur
   */
  getTrendColor(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  }
}