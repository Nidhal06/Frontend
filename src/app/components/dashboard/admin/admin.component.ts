import { Component, OnInit, HostListener , OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from '../../../services/environments/environment';
import { Subscription } from 'rxjs';

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  series?: {
    name: string;
    value: number;
  }[];
}

interface ManagementMenu {
  title: string;
  icon: string;
  description: string;
  onClick: () => void;
}

interface CustomColorScheme extends Color {
  domain: string[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit ,  OnDestroy {
  isOpen = false;
  isLoggedIn = false; 
  profileImagePath: string = '';
  username = ''; 
  scrolled = false;
  activeTab = 'overview';
  userCount = 0;
  activeUserCount = 0;
  users: any[] = [];
  filteredUsers: any[] = []; 
  recentUsers: any[] = [];
  private profileUpdateSubscription!: Subscription;

  constructor(
    public router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.updateUserInfo();
      
      // Subscribe to profile updates
      this.profileUpdateSubscription = this.authService.profileUpdated$.subscribe(updatedUser => {
        if (updatedUser) {
          // Mettre à jour les informations de l'utilisateur courant
          this.profileImagePath = updatedUser.profileImagePath 
            ? `${environment.apiUrl}${updatedUser.profileImagePath}`
            : '';
          this.username = updatedUser.username || 'Admin';
          
          // Mettre à jour aussi dans la liste des utilisateurs si nécessaire
          this.updateUserInList(updatedUser);
        }
      });
    }
    this.loadStats();
  }

  ngOnDestroy(): void {
    if (this.profileUpdateSubscription) {
      this.profileUpdateSubscription.unsubscribe();
    }
  }

  private updateUserInfo(): void {
    const user = this.authService.getCurrentUser();
    this.username = user?.username || 'Admin';
    this.profileImagePath = user?.profileImagePath 
      ? `${environment.apiUrl}${user.profileImagePath}`
      : '';
  }

  private updateUserInList(updatedUser: any): void {
    if (this.users && this.users.length > 0) {
      const index = this.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...updatedUser };
        this.filteredUsers = [...this.users];
      }
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

  revenueBarData: ChartData[] = [
    { name: 'Janvier', value: 5800 },
    { name: 'Février', value: 6200 },
    { name: 'Mars', value: 8100 },
    { name: 'Avril', value: 7400 },
    { name: 'Mai', value: 9200 },
    { name: 'Juin', value: 10500 },
  ];

  revenueLineData = [
    {
      name: 'Revenus',
      series: [
        { name: 'Jan', value: 5800 },
        { name: 'Fév', value: 6200 },
        { name: 'Mar', value: 8100 },
        { name: 'Avr', value: 7400 },
        { name: 'Mai', value: 9200 },
        { name: 'Juin', value: 10500 },
      ]
    }
  ];
  
  occupancyData: ChartData[] = [
    { name: 'Jan', value: 68 },
    { name: 'Fév', value: 72 },
    { name: 'Mar', value: 85 },
    { name: 'Avr', value: 79 },
    { name: 'Mai', value: 88 },
    { name: 'Juin', value: 92 },
  ];

  subscriptionData: ChartData[] = [
    { name: 'Standard', value: 45 },
    { name: 'Premium', value: 30 },
    { name: 'Entreprise', value: 25 },
  ];

  spaceUtilizationData: ChartData[] = [
    { name: 'Open Space', value: 40 },
    { name: 'Bureaux', value: 35 },
    { name: 'Salles de réunion', value: 25 },
  ];

  userStatusData: ChartData[] = [
    { name: 'Actifs', value: 85 },
    { name: 'Inactifs', value: 15 },
  ];

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal, 
    domain: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  };

  stats: Stat[] = [
    {
      title: 'Revenus du mois',
      value: '10,500 €',
      change: '+12.5%',
      trend: 'up',
      description: 'par rapport au mois dernier'
    },
    {
      title: 'Nouveaux utilisateurs',
      value: '24',
      change: '+8.2%',
      trend: 'up',
      description: 'par rapport au mois dernier'
    },
    {
      title: 'Taux d\'occupation',
      value: '92%',
      change: '+4.3%',
      trend: 'up',
      description: 'par rapport au mois dernier'
    },
    {
      title: 'Réservations',
      value: '187',
      change: '-2.1%',
      trend: 'down',
      description: 'par rapport au mois dernier'
    },
  ];

  loadStats(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users; // Initialise this.users
      this.filteredUsers = [...users]; // Initialise this.filteredUsers
      this.userCount = users.length;
      this.activeUserCount = users.filter(u => u.enabled).length;
      this.recentUsers = users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(user => ({
          ...user,
          profileImagePath: user.profileImagePath
            ? `${environment.apiUrl}${user.profileImagePath}`
            : null
        }));
    });
  }
  

  get currentUserEmail(): string {
    const token = this.authService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || 'Admin';
    }
    return 'Admin';
  }

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
      onClick: () => this.router.navigate(['/reception/reservations'])
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
      onClick: () => this.router.navigate(['/admin/blackout-periods'])
    }
];

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  getTrendIcon(trend: 'up' | 'down' | 'neutral') {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'remove';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'neutral') {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }
}