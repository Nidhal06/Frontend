import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Subscription } from 'rxjs';
import { ProfilDto } from '../../types/entities';
import { environment } from 'src/app/services/environments/environment';
import { ToastrService } from 'ngx-toastr';

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
  dashboardLink = '';
  private profileUpdateSubscription!: Subscription;

  constructor(
    public router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.onWindowScroll();
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
    this.profileService.getProfile().subscribe({
      next: (profile: ProfilDto) => {
        this.updateProfileInfo(profile);
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.toastr.error('Erreur lors du chargement du profil', 'Erreur');
      }
    });
  }

  private setupProfileUpdates(): void {
  this.profileUpdateSubscription = this.profileService.profileUpdated$.subscribe(
    (updatedProfile: ProfilDto | null) => {
      if (updatedProfile) {
        this.updateProfileInfo(updatedProfile);
      }
    }
  );
}

  private updateProfileInfo(profile: ProfilDto): void {
    this.username = profile.username;
    this.userEmail = profile.email;
    this.profileImagePath = profile.profileImagePath 
      ? `${environment.apiUrl}${profile.profileImagePath}` 
      : '';
  }

  private setDashboardLink(): void {
    if (this.authService.isAdmin()) {
      this.dashboardLink = '/admin-dashboard';
    } else if (this.authService.isReceptionist()) {
      this.dashboardLink = '/receptioniste-dashboard';
    } else if (this.authService.isCoworker()) {
      this.dashboardLink = '/coworker-dashboard';
    }
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

  handleLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.toastr.success('Déconnexion réussie', 'À bientôt !');
    this.router.navigate(['/signin']);
  }
}