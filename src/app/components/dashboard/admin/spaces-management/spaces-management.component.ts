// spaces-management.component.ts
import { Component, OnInit } from '@angular/core';
import { PrivateSpaceService } from 'src/app/services/privatespace.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AmenityService } from 'src/app/services/amenity.service';
import Swal from 'sweetalert2';
import { PrivateSpace, Amenity } from '../../../../services/space.model';

@Component({
  selector: 'app-spaces-management',
  templateUrl: './spaces-management.component.html',
  styleUrls: ['./spaces-management.component.css']
})
export class SpacesManagementComponent implements OnInit {
  spaces: PrivateSpace[] = [];
  filteredSpaces: PrivateSpace[] = [];
  isLoading = true;
  searchQuery = '';
  currentSpace: PrivateSpace | null = null;
  
  // Forms
  spaceForm: FormGroup;
  editForm: FormGroup;
  
  // Amenities
  amenities: Amenity[] = [];
  selectedAmenities: number[] = [];
  
  // Images
  selectedImages: File[] = [];
  previewImages: string[] = [];
  mainPhoto: File | null = null;
  mainPhotoPreview: string | null = null;
  
  // State
  isUploading = false;
  imagesToDelete: string[] = [];

  constructor(
    private spaceService: PrivateSpaceService,
    private amenityService: AmenityService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.spaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      pricePerDay: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      amenities: [[]]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      pricePerDay: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    this.loadSpaces();
    this.loadAmenities();
  }

  loadSpaces(): void {
    this.isLoading = true;
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.spaces = spaces;
        this.filteredSpaces = [...spaces];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading spaces:', err);
        this.isLoading = false;
        Swal.fire('Error', 'Could not load spaces', 'error');
      }
    });
  }

  loadAmenities(): void {
    this.amenityService.getAllAmenities().subscribe({
      next: (amenities) => {
        this.amenities = amenities;
      },
      error: (err) => {
        console.error('Error loading amenities:', err);
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSpaces = [...this.spaces];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredSpaces = this.spaces.filter(space =>
        space.name.toLowerCase().includes(query) ||
        (space.description && space.description.toLowerCase().includes(query))
      );
    }
  }

  openAddModal(content: any): void {
    this.spaceForm.reset({
      name: '',
      description: '',
      capacity: 1,
      pricePerHour: 0,
      pricePerDay: 0,
      isActive: true,
      amenities: []
    });
    this.selectedAmenities = [];
    this.selectedImages = [];
    this.previewImages = [];
    this.mainPhoto = null;
    this.mainPhotoPreview = null;
    this.modalService.open(content, { ariaLabelledBy: 'add-space-modal', size: 'lg' });
  }

  openEditModal(content: any, space: PrivateSpace): void {
    this.currentSpace = space;
    this.editForm.patchValue({
      name: space.name,
      description: space.description || '',
      capacity: space.capacity,
      pricePerHour: space.pricePerHour,
      pricePerDay: space.pricePerDay,
      isActive: space.isActive,
      amenities: space.amenities?.map(a => a.id) || []
    });
    this.selectedAmenities = space.amenities?.map(a => a.id) || [];
    this.previewImages = [];
    this.mainPhoto = null;
    this.mainPhotoPreview = null;
    this.imagesToDelete = [];
    this.modalService.open(content, { ariaLabelledBy: 'edit-space-modal', size: 'lg' });
  }

  onAmenityChange(amenityId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedAmenities.push(amenityId);
    } else {
      this.selectedAmenities = this.selectedAmenities.filter(id => id !== amenityId);
    }
  }

  onMainPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.mainPhoto = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mainPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeMainPhoto(): void {
    this.mainPhoto = null;
    this.mainPhotoPreview = null;
    if (this.currentSpace?.photo) {
      this.imagesToDelete.push(this.currentSpace.photo);
    }
  }

  onGallerySelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedImages.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeGalleryImage(index: number): void {
    this.previewImages.splice(index, 1);
    this.selectedImages.splice(index, 1);
  }

  removeExistingGalleryImage(index: number): void {
    if (this.currentSpace?.gallery && this.currentSpace.gallery.length > index) {
      this.imagesToDelete.push(this.currentSpace.gallery[index]);
      this.currentSpace.gallery.splice(index, 1);
      if (this.currentSpace.galleryUrls) {
        this.currentSpace.galleryUrls.splice(index, 1);
      }
    }
  }

  addSpace(): void {
    if (this.spaceForm.invalid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }
  
    if (!this.mainPhoto) {
      Swal.fire('Error', 'Main photo is required', 'error');
      return;
    }
  
    const spaceData = {
      ...this.spaceForm.value,
      amenityIds: this.selectedAmenities
    };
  
    this.isUploading = true;
    this.spaceService.createSpace(spaceData, this.mainPhoto, this.selectedImages).subscribe({
      next: (newSpace) => {
        this.spaces.push(newSpace);
        this.filteredSpaces = [...this.spaces];
        this.modalService.dismissAll();
        Swal.fire('Success', 'Space created successfully', 'success');
      },
      error: (err) => {
        console.error('Error creating space:', err);
        Swal.fire('Error', 'Failed to create space', 'error');
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  updateSpace(): void {
    if (!this.currentSpace || this.editForm.invalid) {
      Swal.fire('Error', 'Invalid form data', 'error');
      return;
    }
  
    const spaceData = {
      ...this.editForm.value,
      amenityIds: this.selectedAmenities
    };
  
    this.isUploading = true;
    this.spaceService.updateSpace(
      this.currentSpace.id, 
      spaceData, 
      this.mainPhoto || undefined, 
      this.selectedImages
    ).subscribe({
      next: (updatedSpace) => {
        const index = this.spaces.findIndex(s => s.id === updatedSpace.id);
        if (index !== -1) {
          this.spaces[index] = updatedSpace;
          this.filteredSpaces = [...this.spaces];
        }
        this.modalService.dismissAll();
        Swal.fire('Success', 'Space updated successfully', 'success');
      },
      error: (err) => {
        console.error('Error updating space:', err);
        Swal.fire('Error', err.error?.message || 'Failed to update space', 'error');
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  deleteSpace(spaceId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spaceService.deleteSpace(spaceId).subscribe({
          next: () => {
            this.spaces = this.spaces.filter(s => s.id !== spaceId);
            this.filteredSpaces = this.filteredSpaces.filter(s => s.id !== spaceId);
            Swal.fire('Deleted!', 'Space has been deleted.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to delete space', 'error');
          }
        });
      }
    });
  }

  toggleSpaceStatus(space: PrivateSpace): void {
    this.spaceService.toggleSpaceStatus(space.id).subscribe({
      next: (updatedSpace) => {
        const index = this.spaces.findIndex(s => s.id === updatedSpace.id);
        if (index !== -1) {
          this.spaces[index].isActive = updatedSpace.isActive;
        }
        Swal.fire('Success', 'Space status updated', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to update status', 'error');
      }
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}