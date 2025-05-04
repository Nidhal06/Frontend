import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../services/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isOpen = false;
  isLoggedIn = false;
  profileImagePath: string = '';
  username = '';
  userEmail = '';
  scrolled = false;
  dashboardLink = ''; // Nouvelle propriété pour stocker le lien du dashboard
  private profileUpdateSubscription!: Subscription;

  constructor(
    public router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.updateUserInfo();
      this.setupProfileUpdates();
      this.setDashboardLink();
    }
  }

  private updateUserInfo(): void {
    const user = this.authService.getCurrentUser();
    this.username = user?.username || 'Utilisateur';
    this.userEmail = user?.email || '';
    this.profileImagePath = user?.profileImagePath 
      ? `${environment.apiUrl}${user.profileImagePath}`
      : '';
  }

  private setupProfileUpdates(): void {
    this.profileUpdateSubscription = this.authService.profileUpdated$.subscribe(updatedUser => {
      if (updatedUser) {
        this.profileImagePath = updatedUser.profileImagePath 
          ? `${environment.apiUrl}${updatedUser.profileImagePath}`
          : '';
        this.username = updatedUser.username || 'Utilisateur';
        this.userEmail = updatedUser.email || '';
        this.setDashboardLink();
      }
    });
  }

  private setDashboardLink(): void {
    const user = this.authService.getCurrentUser();
    const primaryRole = user?.roles?.[0] || ''; // Prend le premier rôle
    this.dashboardLink = this.authService.getRoleBasedRedirectPath(primaryRole);
  }

  ngOnDestroy(): void {
    if (this.profileUpdateSubscription) {
      this.profileUpdateSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50;
  }

  handleLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/signin']);
  }
}