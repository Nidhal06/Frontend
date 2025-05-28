
import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EspaceService } from '../../../../services/espace.service';
import { EspaceDTO, EspacePriveDTO, EspaceOuvertDTO } from '../../../../types/entities';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../services/environments/environment';
@Component({
  selector: 'app-spaces-management',
  templateUrl: './spaces-management.component.html',
  styleUrls: ['./spaces-management.component.css']
})
export class SpacesManagementComponent implements OnInit {
  espaces: (EspaceDTO | EspacePriveDTO | EspaceOuvertDTO)[] = [];
  filteredEspaces: EspaceDTO[] = [];
  isLoading = true;
  searchQuery = '';
  currentEspace: EspaceDTO | null = null;
  
  espaceForm: FormGroup;
  editForm: FormGroup;
  
  selectedImages: File[] = [];
  previewImages: string[] = [];
  mainPhoto: File | undefined = undefined;
  mainPhotoPreview: string | null = null;
  
  isUploading = false;
  imagesToDelete: string[] = [];
  environment = environment;

  @ViewChild('deleteSpaceModal') deleteSpaceModal: any;
  
  espaceTypes = [
    { value: 'PRIVE', display: 'Espace Privé' },
    { value: 'OUVERT', display: 'Espace Ouvert' }
  ];

  constructor(
    private espaceService: EspaceService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.espaceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      capacity: [1, [Validators.required, Validators.min(1)]],
      type: ['PRIVE', Validators.required],
      prixParJour: [0],
      amenities: [''],
      isActive: [true]
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      capacity: [1, [Validators.required, Validators.min(1)]],
      type: ['PRIVE', Validators.required],
      prixParJour: [0],
      amenities: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadEspaces();
  }

  loadEspaces(): void {
  this.isLoading = true;
  this.espaceService.getAllEspaces().subscribe({
    next: (espaces) => {
      this.espaces = espaces.map((espace) => {
        // Créez un objet de base avec les champs communs
        const baseEspace = {
          ...espace,
          photoPrincipal: espace.photoPrincipal 
            ? `${environment.apiUrl}${espace.photoPrincipal}`
            : 'assets/images/default-space.jpg',
          gallery: espace.gallery?.map(img => `${environment.apiUrl}${img}`) || []
        };

        // Si c'est un espace privé, ajoutez les champs spécifiques
        if (espace.type === 'PRIVE') {
          return {
            ...baseEspace,
            prixParJour: (espace as any).prixParJour || 0, 
            amenities: (espace as any).amenities || []
          } as EspacePriveDTO;
        } else {
          return baseEspace as EspaceOuvertDTO;
        }
      });

      this.filteredEspaces = [...this.espaces];
      this.isLoading = false;
      
      // Debug: Vérifiez le résultat dans la console
      console.log('Espaces chargés:', this.espaces);
    },
    error: (err) => {
      console.error('Error loading spaces:', err);
      this.isLoading = false;
      this.toastr.error('Erreur lors du chargement des espaces', 'Erreur');
    }
  });
}


  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredEspaces = [...this.espaces];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredEspaces = this.espaces.filter(espace =>
      (espace.name?.toLowerCase().includes(query)) ||
      (espace.description?.toLowerCase().includes(query)) ||
      (espace.type?.toLowerCase().includes(query))
    );
  }

  openAddModal(content: any): void {
    this.resetForms();
    this.clearImages();
    this.espaceForm.reset({
      type: 'PRIVE',
      capacity: 1,
      isActive: true
    });
    this.modalService.open(content, { ariaLabelledBy: 'add-space-modal', size: 'lg' });
  }

 openEditModal(content: any, espace: EspaceDTO): void {
    // Conversion forcée pour accéder aux champs cachés
    const espaceData = espace as any;
    
    // Debug complet
    console.log('Données complètes:', {
      ...espaceData,
      prixExist: 'prixParJour' in espaceData,
      amenitiesExist: 'amenities' in espaceData
    });

    this.currentEspace = espace;
    this.clearImages();

    // Préparation des valeurs avec fallback explicite
    const formValues = {
      name: espaceData.name,
      description: espaceData.description,
      capacity: espaceData.capacity,
      type: espaceData.type,
      isActive: espaceData.isActive,
      prixParJour: espaceData.type === 'PRIVE' 
        ? (espaceData.prixParJour || espaceData.prix || 0)
        : 0,
      amenities: espaceData.type === 'PRIVE'
        ? (espaceData.amenities || []).join(', ')
        : ''
    };

    // Réinitialisation complète du formulaire
    this.editForm.reset(formValues);
    
    // Gestion de l'image
    this.mainPhotoPreview = espaceData.photoPrincipal || null;
    
    this.modalService.open(content, { ariaLabelledBy: 'edit-space-modal', size: 'lg' });
}

  onMainPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.mainPhoto = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.mainPhotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onGallerySelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
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

  removeMainPhoto(): void {
    this.mainPhoto = undefined;
    this.mainPhotoPreview = null;
    if (this.currentEspace?.photoPrincipal) {
      this.imagesToDelete.push(this.currentEspace.photoPrincipal);
    }
  }

  removeGalleryImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  removeExistingGalleryImage(index: number): void {
    if (this.currentEspace?.gallery?.[index]) {
      this.imagesToDelete.push(this.currentEspace.gallery[index]);
      this.currentEspace.gallery.splice(index, 1);
    }
  }

  clearImages(): void {
    this.selectedImages = [];
    this.previewImages = [];
    this.mainPhoto = undefined;
    this.mainPhotoPreview = null;
    this.imagesToDelete = [];
  }

  resetForms(): void {
    this.espaceForm.reset({
      type: 'PRIVE',
      capacity: 1,
      isActive: true
    });
    this.editForm.reset({
      type: 'PRIVE',
      capacity: 1,
      isActive: true
    });
  }

  addEspace(): void {
  if (this.espaceForm.invalid || !this.mainPhoto) {
    this.toastr.warning('Veuillez remplir tous les champs obligatoires', 'Formulaire invalide');
    return;
  }

  this.isUploading = true;

  const espaceData: any = {
    name: this.espaceForm.value.name,
    description: this.espaceForm.value.description,
    capacity: this.espaceForm.value.capacity,
    type: this.espaceForm.value.type,
    isActive: this.espaceForm.value.isActive,
    photoPrincipal: '',
    gallery: [] 
  };

  // Add private space specific fields if needed
  if (this.espaceForm.value.type === 'PRIVE') {
    espaceData.prixParJour = this.espaceForm.value.prixParJour;
    espaceData.amenities = this.espaceForm.value.amenities?.split(',').map((item: string) => item.trim()) || [];
  }

  const createObservable = this.espaceForm.value.type === 'PRIVE' 
    ? this.espaceService.createEspacePrive(espaceData, this.mainPhoto, this.selectedImages)
    : this.espaceService.createEspaceOuvert(espaceData, this.mainPhoto, this.selectedImages);

  createObservable.subscribe({
    next: (createdEspace) => {
      this.espaces.push({
        ...createdEspace,
        photoPrincipal: createdEspace.photoPrincipal 
          ? `${environment.apiUrl}${createdEspace.photoPrincipal}`
          : 'assets/images/default-space.jpg',
        gallery: createdEspace.gallery?.map(img => `${environment.apiUrl}${img}`) || []
      });
      this.filteredEspaces = [...this.espaces];
      this.modalService.dismissAll();
      this.isUploading = false;
      this.toastr.success('Espace créé avec succès', 'Succès');
    },
    error: (err) => {
      console.error('Error creating space:', err);
      this.isUploading = false;
      this.toastr.error(err.error?.message || err.message || 'Erreur lors de la création', 'Erreur');
    }
  });
}

  updateEspace(): void {
  if (!this.currentEspace || this.editForm.invalid) {
    this.toastr.warning('Veuillez vérifier les informations', 'Formulaire invalide');
    return;
  }

  this.isUploading = true;

  // Créer l'objet DTO de base
  const baseEspace = {
    name: this.editForm.value.name,
    description: this.editForm.value.description,
    capacity: this.editForm.value.capacity,
    type: this.editForm.value.type,
    isActive: this.editForm.value.isActive,
    photoPrincipal: this.currentEspace.photoPrincipal?.replace(`${environment.apiUrl}`, '') || '',
    gallery: this.currentEspace.gallery?.map(img => img.replace(`${environment.apiUrl}`, '')) || []
  };

  let espaceData: EspacePriveDTO | EspaceOuvertDTO;

  if (this.editForm.value.type === 'PRIVE') {
    espaceData = {
      ...baseEspace,
      prixParJour: this.editForm.value.prixParJour,
      amenities: this.editForm.value.amenities?.split(',').map((item: string) => item.trim()) || []
    } as EspacePriveDTO;
  } else {
    espaceData = baseEspace as EspaceOuvertDTO;
  }

  const updateObservable = this.editForm.value.type === 'PRIVE'
    ? this.espaceService.updateEspacePrive(
        this.currentEspace.id!, 
        espaceData as EspacePriveDTO, 
        this.mainPhoto, 
        this.selectedImages,
        this.imagesToDelete
      )
    : this.espaceService.updateEspaceOuvert(
        this.currentEspace.id!, 
        espaceData as EspaceOuvertDTO, 
        this.mainPhoto, 
        this.selectedImages,
        this.imagesToDelete
      );

  updateObservable.subscribe({
    next: (updatedEspace) => {
      const index = this.espaces.findIndex(e => e.id === updatedEspace.id);
      if (index !== -1) {
        this.espaces[index] = {
          ...updatedEspace,
          photoPrincipal: updatedEspace.photoPrincipal 
            ? `${environment.apiUrl}${updatedEspace.photoPrincipal}`
            : 'assets/images/default-space.jpg',
          gallery: updatedEspace.gallery?.map(img => `${environment.apiUrl}${img}`) || []
        };
        this.filteredEspaces = [...this.espaces];
      }
      this.modalService.dismissAll();
      this.isUploading = false;
      this.toastr.success('Espace mis à jour', 'Succès');
    },
    error: (err) => {
      console.error('Error updating space:', err);
      this.isUploading = false;
      this.toastr.error(err.error?.message || 'Erreur lors de la mise à jour', 'Erreur');
    }
  });
}

openDeleteConfirmation(content: any, espace: EspaceDTO): void {
  this.currentEspace = espace;
  this.modalService.open(content);
}
   
// Supprimez la méthode deleteEspace existante et gardez seulement :
deleteEspace(espace: EspaceDTO): void {
  this.currentEspace = espace;
  this.modalService.open(this.deleteSpaceModal);
}

performDelete(): void {
  if (!this.currentEspace || !this.currentEspace.id) return;

  const deleteObservable = this.currentEspace.type === 'PRIVE'
    ? this.espaceService.deleteEspacePrive(this.currentEspace.id)
    : this.espaceService.deleteEspaceOuvert(this.currentEspace.id);

  deleteObservable.subscribe({
    next: () => {
      this.espaces = this.espaces.filter(e => e.id !== this.currentEspace?.id);
      this.filteredEspaces = this.filteredEspaces.filter(e => e.id !== this.currentEspace?.id);
      this.toastr.success('Espace supprimé avec succès', 'Succès');
    },
    error: (err) => {
      this.toastr.error(err.error?.message || 'Erreur lors de la suppression', 'Erreur');
    }
  });
}

  toggleEspaceStatus(espace: EspaceDTO): void {
    const updatedEspace = { ...espace, isActive: !espace.isActive };
    const updateObservable = espace.type === 'PRIVE'
      ? this.espaceService.updateEspacePrive(espace.id!, updatedEspace as any)
      : this.espaceService.updateEspaceOuvert(espace.id!, updatedEspace as any);

    updateObservable.subscribe({
      next: (result) => {
        const index = this.espaces.findIndex(e => e.id === result.id);
        if (index !== -1) {
          this.espaces[index].isActive = result.isActive;
          this.filteredEspaces = [...this.espaces];
        }
        this.toastr.success('Statut de l\'espace mis à jour', 'Succès');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors de la modification', 'Erreur');
      }
    });
  }

  getTypeBadgeClass(type: string): string {
    return type === 'PRIVE' ? 'bg-primary' : 'bg-success';
  }

  getTypeText(type: string): string {
    return type === 'PRIVE' ? 'Privé' : 'Ouvert';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  getPrixParJour(espace: EspaceDTO): string {
  // Pour les espaces privés
  if (espace.type === 'PRIVE') {
    const priveEspace = espace as EspacePriveDTO;
    
    // Si prixParJour existe et est > 0
    if (priveEspace.prixParJour && priveEspace.prixParJour > 0) {
      return `${priveEspace.prixParJour} TND/j`;
    }
    
    // Si prixParJour est 0 ou non défini
    return 'Gratuit';
  }
  
  // Pour les espaces ouverts
  return 'Abonnement';
}
}