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

@Component({
  selector: 'app-coworker-dashboard',
  templateUrl: './coworker-dashboard.component.html',
  styleUrls: ['./coworker-dashboard.component.css']
})
export class CoworkerDashboardComponent implements OnInit, OnDestroy {
  isOpen = false;
  isLoggedIn = false;
  profileImagePath: string = '';
  environment = environment;
  username = '';
  scrolled = false;
  activeTab = 'overview';
  users: UserDTO[] = [];
  isLoading = true;
  private profileUpdateSubscription!: Subscription;

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

  constructor(
    public router: Router,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
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
}
