import { Component, OnInit } from '@angular/core';
import { EspaceDTO, EspacePriveDTO } from '../../../types/entities';
import { EspaceService } from '../../../services/espace.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/app/services/environments/environment';

/**
 * Composant PrivateSpaces - Gestion et affichage des espaces privés
 */
@Component({
  selector: 'app-private-spaces',
  templateUrl: './private-spaces.component.html',
  styleUrls: ['./private-spaces.component.css']
})
export class PrivateSpacesComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données des espaces
  spaces: EspacePriveDTO[] = [];
  filteredSpaces: EspacePriveDTO[] = [];
  featuredSpaces: (EspaceDTO | EspacePriveDTO)[] = [];

  // Filtres et tris
  searchTerm = '';
  capacityFilter = 'all';
  amenitiesFilter: string[] = [];
  sortBy = 'default';
  allAmenities: string[] = [
    'Wi-Fi', 'Projecteur', 'Climatisation', 'Tableau blanc', 
    'Télévision', 'Système audio', 'Café/thé', 'Parking'
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;

  // États
  isLoading = true;
  environment = environment;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private espaceService: EspaceService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.loadPrivateSpaces();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge les espaces privés depuis l'API
   */
  loadPrivateSpaces(): void {
    this.isLoading = true;
    this.espaceService.getAllEspacePrives().subscribe({
      next: (spaces) => {
        this.processSpaces(spaces);
        this.isLoading = false;
      },
      error: (error) => {
        this.handleLoadError(error);
      }
    });
  }

  /**
   * Traite les espaces récupérés depuis l'API
   * @param spaces Liste des espaces privés
   */
  private processSpaces(spaces: EspacePriveDTO[]): void {
    this.spaces = spaces.map(space => this.processSpaceImage(space));
    this.filteredSpaces = [...this.spaces];
    this.extractAllAmenities();
    this.applyFilters();
  }

  /**
   * Traite l'URL de l'image d'un espace
   * @param space Espace à traiter
   * @returns Espace avec l'URL de l'image nettoyée
   */
  private processSpaceImage(space: EspacePriveDTO): EspacePriveDTO {
    let cleanedPhoto = space.photoPrincipal;
    if (cleanedPhoto) {
      cleanedPhoto = cleanedPhoto.replace(/^http:\/\/localhost:1010/, '');
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
  }

  /**
   * Gère les erreurs de chargement
   * @param error Erreur survenue
   */
  private handleLoadError(error: any): void {
    console.error('Error loading private spaces:', error);
    this.toastr.error('Erreur lors du chargement des espaces privés', 'Erreur');
    this.isLoading = false;
  }

  // =============================================
  // SECTION: GESTION DES FILTRES
  // =============================================

  /**
   * Applique les filtres et tris sur la liste des espaces
   */
  applyFilters(): void {
    let result = [...this.spaces];

    // Filtre par recherche
    result = this.applySearchFilter(result);

    // Filtre par capacité
    result = this.applyCapacityFilter(result);

    // Filtre par équipements
    result = this.applyAmenitiesFilter(result);

    // Tri
    result = this.applySorting(result);

    this.updateFilteredSpaces(result);
  }

  /**
   * Applique le filtre de recherche
   * @param spaces Liste des espaces à filtrer
   * @returns Liste filtrée
   */
  private applySearchFilter(spaces: EspacePriveDTO[]): EspacePriveDTO[] {
    if (!this.searchTerm) return spaces;
    
    const term = this.searchTerm.toLowerCase();
    return spaces.filter(space => 
      space.name.toLowerCase().includes(term) || 
      space.description.toLowerCase().includes(term));
  }

  /**
   * Applique le filtre de capacité
   * @param spaces Liste des espaces à filtrer
   * @returns Liste filtrée
   */
  private applyCapacityFilter(spaces: EspacePriveDTO[]): EspacePriveDTO[] {
    if (this.capacityFilter === 'all') return spaces;
    
    const minCapacity = parseInt(this.capacityFilter);
    return spaces.filter(space => space.capacity >= minCapacity);
  }

  /**
   * Applique le filtre d'équipements
   * @param spaces Liste des espaces à filtrer
   * @returns Liste filtrée
   */
  private applyAmenitiesFilter(spaces: EspacePriveDTO[]): EspacePriveDTO[] {
    if (this.amenitiesFilter.length === 0) return spaces;
    
    return spaces.filter(space => 
      this.amenitiesFilter.every(amenity => 
        space.amenities?.includes(amenity)));
  }

  /**
   * Applique le tri
   * @param spaces Liste des espaces à trier
   * @returns Liste triée
   */
  private applySorting(spaces: EspacePriveDTO[]): EspacePriveDTO[] {
    switch (this.sortBy) {
      case 'price-asc':
        return [...spaces].sort((a, b) => a.prixParJour - b.prixParJour);
      case 'price-desc':
        return [...spaces].sort((a, b) => b.prixParJour - a.prixParJour);
      case 'capacity-asc':
        return [...spaces].sort((a, b) => a.capacity - b.capacity);
      case 'capacity-desc':
        return [...spaces].sort((a, b) => b.capacity - a.capacity);
      default:
        return spaces;
    }
  }

  /**
   * Met à jour la liste filtrée et réinitialise la pagination
   * @param result Liste filtrée et triée
   */
  private updateFilteredSpaces(result: EspacePriveDTO[]): void {
    this.filteredSpaces = result;
    this.currentPage = 1;
    this.totalItems = this.filteredSpaces.length;
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.capacityFilter = 'all';
    this.amenitiesFilter = [];
    this.sortBy = 'default';
    this.applyFilters();
  }

  /**
   * Bascule un équipement dans les filtres
   * @param amenity Équipement à ajouter/retirer
   */
  toggleAmenityFilter(amenity: string): void {
    const index = this.amenitiesFilter.indexOf(amenity);
    if (index === -1) {
      this.amenitiesFilter.push(amenity);
    } else {
      this.amenitiesFilter.splice(index, 1);
    }
    this.applyFilters();
  }

  // =============================================
  // SECTION: EXTRACTION DES ÉQUIPEMENTS
  // =============================================

  /**
   * Extrait tous les équipements uniques des espaces
   */
  extractAllAmenities(): void {
    const amenitiesSet = new Set<string>(this.allAmenities);
    this.spaces.forEach(space => {
      if (space.amenities) {
        space.amenities.forEach(amenity => amenitiesSet.add(amenity));
      }
    });
    this.allAmenities = Array.from(amenitiesSet);
  }

  // =============================================
  // SECTION: PAGINATION
  // =============================================

  /**
   * Getter pour les espaces paginés
   * @returns Liste des espaces pour la page courante
   */
  get paginatedSpaces(): EspacePriveDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSpaces.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcule le nombre total de pages
   * @returns Nombre total de pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredSpaces.length / this.itemsPerPage);
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
   * Change la page courante
   * @param page Numéro de page
   */
  pageChanged(page: number): void {
    this.currentPage = page;
  }

  // =============================================
  // SECTION: UTILITAIRES
  // =============================================

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns true si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}