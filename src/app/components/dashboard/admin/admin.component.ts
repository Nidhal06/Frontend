import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../services/environments/environment';
import { Subscription } from 'rxjs';
import { UserDTO } from '../../../types/entities';
import { ToastrService } from 'ngx-toastr';


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
  isOpen = false;
  isLoggedIn = false;
  profileImagePath: string = '';
  environment = environment;
  username = '';
  scrolled = false;
  activeTab = 'overview';
  userCount = 0;
  activeUserCount = 0;
  users: UserDTO[] = [];
  recentUsers: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  isLoading = true;
  private profileUpdateSubscription!: Subscription;

  managementMenus: ManagementMenu[] = [
    {
      title: 'Gestion des utilisateurs',
      icon: 'bi-people-fill',
      description: 'Gérer les comptes utilisateurs, les rôles et les permissions',
      onClick: () => this.router.navigate(['/admin-dashboard/users'])
    },
    {
      title: 'Gestion des espaces',
      icon: 'bi-building',
      description: 'Gérer les espaces de travail, les salles et leur disponibilité',
      onClick: () => this.router.navigate(['/admin-dashboard/spaces'])
    },
    {
      title: 'Réservations & Planning',
      icon: 'bi-calendar-date',
      description: 'Consulter et gérer les réservations actuelles et futures',
      onClick: () => this.router.navigate(['/admin-dashboard/reservations'])
    },
    {
      title: 'Gestion des événements',
      icon: 'bi-calendar-event',
      description: 'Créer et gérer des événements',
      onClick: () => this.router.navigate(['/admin-dashboard/events'])
    },
    {
      title: 'Gestion des abonnements',
      icon: 'bi-credit-card',
      description: 'Gérer les offres d\'abonnement',
      onClick: () => this.router.navigate(['/admin-dashboard/subscriptions'])
    },
    {
      title: 'Périodes d\'indisponibilité',
      icon: 'bi-calendar-x',
      description: 'Gérer les périodes où les espaces sont indisponibles',
      onClick: () => this.router.navigate(['/admin-dashboard/blackout-periods'])
    }
  ];

  constructor(
    public router: Router,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadRecentUsers();
    this.loadUserStats();
  }

  ngOnDestroy(): void {
    if (this.profileUpdateSubscription) {
      this.profileUpdateSubscription.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadCurrentUser();
    }
  }

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


loadRecentUsers(): void {
  this.userService.getAllUsers().subscribe({
      next: (users: UserDTO[]) => {
        this.users = users;
        this.userCount = users.length;
        this.activeUserCount = users.filter(u => u.enabled).length;
        this.prepareRecentUsers();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  private prepareRecentUsers(): void {
    this.recentUsers = this.users
      .sort((a, b) => {
        return (b.id || 0) - (a.id || 0);
      })
      .slice(0, 5)
      .map(user => ({
        ...user,
        profileImagePath: user.profileImagePath 
          ? `${environment.apiUrl}${user.profileImagePath}`
          : '' as string 
      }));
  }

  loadUserStats(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.userCount = users.length;
        this.activeUserCount = users.filter(user => user.enabled).length;
      },
      error: (err) => {
        console.error('Error loading user stats:', err);
      }
    });
  }

  handleLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/signin']);
    this.toastr.success('Déconnexion réussie', 'Succès');
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'remove';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  }

  toggleUserStatus(user: UserDTO): void {
    if (user.id) {
      this.userService.toggleUserStatus(user.id).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.toastr.success(`Statut utilisateur mis à jour`, 'Succès');
          this.loadUserStats();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la mise à jour du statut', 'Erreur');
        }
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== userId);
          this.toastr.success('Utilisateur supprimé avec succès', 'Succès');
          this.loadUserStats();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la suppression de l\'utilisateur', 'Erreur');
        }
      });
    }
  }

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
}