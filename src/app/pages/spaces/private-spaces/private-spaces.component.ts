import { Component, OnInit } from '@angular/core';
import { EspaceDTO , EspacePriveDTO } from '../../../types/entities';
import { EspaceService } from '../../../services/espace.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/app/services/environments/environment';

@Component({
  selector: 'app-private-spaces',
  templateUrl: './private-spaces.component.html',
  styleUrls: ['./private-spaces.component.css']
})
export class PrivateSpacesComponent implements OnInit {
  spaces: EspacePriveDTO[] = [];
  featuredSpaces: (EspaceDTO | EspacePriveDTO)[] = [];
  filteredSpaces: EspacePriveDTO[] = [];
  searchTerm = '';
  capacityFilter = 'all';
  amenitiesFilter: string[] = [];
  sortBy = 'default';
  isLoading = true;
  allAmenities: string[] = [
    'Wi-Fi', 'Projecteur', 'Climatisation', 'Tableau blanc', 
    'Télévision', 'Système audio', 'Café/thé', 'Parking'
  ];
  environment = environment;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;

  constructor(
    private espaceService: EspaceService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadPrivateSpaces();
  }

  loadPrivateSpaces(): void {
  this.isLoading = true;
  this.espaceService.getAllEspacePrives().subscribe({
    next: (spaces) => {
      this.spaces = spaces.map(space => {
        // Nettoyer l'URL en enlevant le domaine si présent
        let cleanedPhoto = space.photoPrincipal;
        if (cleanedPhoto) {
          // Supprimer http://localhost:1010 s'il est présent
          cleanedPhoto = cleanedPhoto.replace(/^http:\/\/localhost:1010/, '');
          // S'assurer que le chemin commence par /
          if (!cleanedPhoto.startsWith('/')) {
            cleanedPhoto = '/' + cleanedPhoto;
          }
        }
        
        return {
          ...space,
          photoPrincipal: cleanedPhoto 
            ? `${environment.apiUrl}${cleanedPhoto}` 
            : 'assets/images/default-space.jpg'
        };
      });

      this.filteredSpaces = [...this.spaces];
      this.extractAllAmenities();
      this.applyFilters();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading private spaces:', error);
      this.toastr.error('Erreur lors du chargement des espaces privés', 'Erreur');
      this.isLoading = false;
    }
  });
 }

  extractAllAmenities(): void {
    const amenitiesSet = new Set<string>();
    this.spaces.forEach(space => {
      if (space.amenities) {
        space.amenities.forEach(amenity => amenitiesSet.add(amenity));
      }
    });
    this.allAmenities = Array.from(amenitiesSet);
  }

  applyFilters(): void {
    let result = [...this.spaces];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(space => 
        space.name.toLowerCase().includes(term) || 
        space.description.toLowerCase().includes(term));
    }

    // Apply capacity filter
    if (this.capacityFilter !== 'all') {
      const minCapacity = parseInt(this.capacityFilter);
      result = result.filter(space => space.capacity >= minCapacity);
    }

    // Apply amenities filter
    if (this.amenitiesFilter.length > 0) {
      result = result.filter(space => 
        this.amenitiesFilter.every(amenity => 
          space.amenities?.includes(amenity)));
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.prixParJour - b.prixParJour);
        break;
      case 'price-desc':
        result.sort((a, b) => b.prixParJour - a.prixParJour);
        break;
      case 'capacity-asc':
        result.sort((a, b) => a.capacity - b.capacity);
        break;
      case 'capacity-desc':
        result.sort((a, b) => b.capacity - a.capacity);
        break;
    }

    this.filteredSpaces = result;
    this.currentPage = 1;
    this.totalItems = this.filteredSpaces.length;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.capacityFilter = 'all';
    this.amenitiesFilter = [];
    this.sortBy = 'default';
    this.applyFilters();
  }

  toggleAmenityFilter(amenity: string): void {
    const index = this.amenitiesFilter.indexOf(amenity);
    if (index === -1) {
      this.amenitiesFilter.push(amenity);
    } else {
      this.amenitiesFilter.splice(index, 1);
    }
    this.applyFilters();
  }

  // Pagination methods
  get paginatedSpaces(): EspacePriveDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSpaces.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredSpaces.length / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pageChanged(page: number): void {
    this.currentPage = page;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}