import { Component, OnInit } from '@angular/core';
import { PrivateSpace, Amenity } from '../../../services/space.model';
import { SpaceService } from '../../../services/space.service';

@Component({
  selector: 'app-private-spaces',
  templateUrl: './private-spaces.component.html',
  styleUrls: ['./private-spaces.component.css']
})
export class PrivateSpacesComponent implements OnInit {
  spaces: any[] = [];
  filteredSpaces: any[] = [];
  searchTerm = '';
  capacityFilter = 'all';
  amenitiesFilter: string[] = [];
  sortBy = 'default';
  isLoading = true;
  allAmenities: string[] = [];

// Pagination properties
  currentPage = 1;
  itemsPerPage = 3;
  totalItems = 0;

  constructor(private spaceService: SpaceService) {}

  ngOnInit() {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.isLoading = true;
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces: any[]) => {
        this.spaces = spaces;
        this.filteredSpaces = [...this.spaces];
        this.totalItems = this.filteredSpaces.length;
        this.isLoading = false;
        
        // Extraire les équipements uniques
        this.allAmenities = Array.from(
          new Set(this.spaces.flatMap((s: any) => s.amenities?.map((a: any) => a.name) || []))
        ).sort() as string[];
      },
      error: (err) => {
        console.error('Error loading spaces:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let results = [...this.spaces];
    
    // Search filter
    if (this.searchTerm) {
      results = results.filter((space: any) => 
        space.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (space.description && space.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    
    // Capacity filter
    if (this.capacityFilter && this.capacityFilter !== 'all') {
      const capacity = parseInt(this.capacityFilter);
      results = results.filter((space: any) => space.capacity >= capacity);
    }
    
    // Amenities filter
    if (this.amenitiesFilter.length > 0) {
      results = results.filter((space: any) => 
        this.amenitiesFilter.every(amenityName => 
          space.amenities?.some((amenity: any) => amenity.name === amenityName)
        )
      );
    }
    
    // Sorting
    if (this.sortBy === 'price-asc') {
      results.sort((a: any, b: any) => a.pricePerHour - b.pricePerHour);
    } else if (this.sortBy === 'price-desc') {
      results.sort((a: any, b: any) => b.pricePerHour - a.pricePerHour);
    } else if (this.sortBy === 'capacity-asc') {
      results.sort((a: any, b: any) => a.capacity - b.capacity);
    } else if (this.sortBy === 'capacity-desc') {
      results.sort((a: any, b: any) => b.capacity - a.capacity);
    }
    
    this.filteredSpaces = results;
    this.totalItems = results.length;
    this.currentPage = 1; 
  }

   // Get current page items
   get paginatedSpaces() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSpaces.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Change page
  pageChanged(page: number) {
    this.currentPage = page;
  }

  // Calculate total pages
getTotalPages(): number {
  return Math.ceil(this.totalItems / this.itemsPerPage);
}

// Generate page numbers for pagination
getPages(): number[] {
  const totalPages = this.getTotalPages();
  const pages: number[] = [];
  
  // Always show first page
  pages.push(1);
  
  // Show pages around current page
  const start = Math.max(2, this.currentPage - 2);
  const end = Math.min(totalPages - 1, this.currentPage + 2);
  
  for (let i = start; i <= end; i++) {
    if (i > 1 && i < totalPages) {
      pages.push(i);
    }
  }
  
  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
}

  toggleAmenityFilter(amenity: string) {
    const index = this.amenitiesFilter.indexOf(amenity);
    if (index >= 0) {
      this.amenitiesFilter.splice(index, 1);
    } else {
      this.amenitiesFilter.push(amenity);
    }
    this.applyFilters();
  }

  resetFilters() {
    this.searchTerm = '';
    this.capacityFilter = 'all';
    this.amenitiesFilter = [];
    this.sortBy = 'default';
    this.applyFilters();
  }

  handleReserve(spaceId: number) {
    console.log(`Reserve space with ID: ${spaceId}`);
    // Add your reservation logic here
  }
}
