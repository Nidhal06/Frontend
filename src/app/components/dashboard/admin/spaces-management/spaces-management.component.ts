import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

// Services
import { EspaceService } from '../../../../services/espace.service';

// Models
import { EspaceDTO, EspacePriveDTO, EspaceOuvertDTO } from '../../../../types/entities';

// Environment
import { environment } from '../../../../services/environments/environment';

/**
 * Composant de gestion des espaces (privés et ouverts)
 * Permet l'ajout, la modification, la suppression et la consultation des espaces
 */
@Component({
  selector: 'app-spaces-management',
  templateUrl: './spaces-management.component.html',
  styleUrls: ['./spaces-management.component.css']
})
export class SpacesManagementComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données
  espaces: (EspaceDTO | EspacePriveDTO | EspaceOuvertDTO)[] = [];
  filteredEspaces: EspaceDTO[] = [];
  currentEspace: EspaceDTO | null = null;
  
  // État du composant
  isLoading = true;
  isUploading = false;
  searchQuery = '';
  
  // Gestion des images
  selectedImages: File[] = [];
  previewImages: string[] = [];
  mainPhoto: File | undefined = undefined;
  mainPhotoPreview: string | null = null;
  imagesToDelete: string[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  // Formulaires
  espaceForm: FormGroup;
  editForm: FormGroup;

  // Configuration
  environment = environment;
  espaceTypes = [
    { value: 'PRIVE', display: 'Espace Privé' },
    { value: 'OUVERT', display: 'Espace Ouvert' }
  ];

  // Référence à la modal de suppression
  @ViewChild('deleteSpaceModal') deleteSpaceModal: any;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  /**
   * Constructeur du composant
   * @param espaceService Service pour les opérations CRUD sur les espaces
   * @param modalService Service pour la gestion des modals
   * @param fb Service pour la construction de formulaires
   * @param toastr Service pour les notifications toast
   */
  constructor(
    private espaceService: EspaceService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    // Initialisation du formulaire d'ajout
    this.espaceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      capacity: [1, [Validators.required, Validators.min(1)]],
      type: ['PRIVE', Validators.required],
      prixParJour: [0],
      amenities: [''],
      isActive: [true]
    });

    // Initialisation du formulaire d'édition
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

  /**
   * Méthode d'initialisation du composant
   * Charge la liste des espaces au chargement du composant
   */
  ngOnInit(): void {
    this.loadEspaces();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge la liste des espaces depuis l'API
   * Gère le mapping des données et les URLs des images
   */
  loadEspaces(): void {
    this.isLoading = true;
    this.espaceService.getAllEspaces().subscribe({
      next: (espaces) => {
        this.espaces = espaces.map((espace) => {
          const baseEspace = {
            ...espace,
            photoPrincipal: espace.photoPrincipal 
              ? espace.photoPrincipal.startsWith('http') 
                ? espace.photoPrincipal 
                : `${environment.apiUrl}${espace.photoPrincipal}`
              : 'assets/images/default-space.jpg',
          };

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
        this.totalItems = this.filteredEspaces.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading spaces:', err);
        this.isLoading = false;
        this.toastr.error('Erreur lors du chargement des espaces', 'Erreur');
      }
    });
  }

  // =============================================
  // SECTION: PAGINATION ET FILTRAGE
  // =============================================

  /**
   * Gère le changement de page
   * @param event Le numéro de la nouvelle page
   */
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  /**
   * Filtre les espaces selon la recherche
   * Met à jour la liste filtrée et réinitialise la pagination
   */
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredEspaces = [...this.espaces];
      this.totalItems = this.filteredEspaces.length;
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredEspaces = this.espaces.filter(espace =>
      (espace.name?.toLowerCase().includes(query)) ||
      (espace.description?.toLowerCase().includes(query)) ||
      (espace.type?.toLowerCase().includes(query))
    );
    this.totalItems = this.filteredEspaces.length;
    this.currentPage = 1;
  }

  /**
   * Retourne les espaces paginés pour l'affichage
   * @returns La liste des espaces pour la page courante
   */
  get paginatedEspaces(): (EspaceDTO | EspacePriveDTO | EspaceOuvertDTO)[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEspaces.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcule l'index du dernier élément de la page
   * @returns L'index de fin de page
   */
  get pageEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // =============================================
  // SECTION: GESTION DES MODALS
  // =============================================

  /**
   * Ouvre la modal d'ajout d'espace
   * @param content Le template de la modal
   */
  openAddModal(content: any): void {
    this.resetForms();
    this.clearImages();
    this.espaceForm.reset({
      type: 'PRIVE',
      capacity: 1,
      isActive: true
    });
    this.modalService.open(content, { 
      ariaLabelledBy: 'add-space-modal', 
      size: 'lg' 
    });
  }

  /**
   * Ouvre la modal d'édition d'espace
   * @param content Le template de la modal
   * @param espace L'espace à éditer
   */
  openEditModal(content: any, espace: EspaceDTO): void {
    const espaceData = espace as any;
    
    this.currentEspace = {
      ...espaceData,
      photoPrincipal: espaceData.photoPrincipal 
        ? espaceData.photoPrincipal.startsWith('http') 
          ? espaceData.photoPrincipal 
          : `${environment.apiUrl}${espaceData.photoPrincipal}`
        : 'assets/images/default-space.jpg',
      gallery: espaceData.gallery?.map((img: string) => 
        img.startsWith('http') ? img : `${environment.apiUrl}${img}`
      ) || []
    };

    this.clearImages();

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

    this.editForm.reset(formValues);
    this.mainPhotoPreview = this.currentEspace?.photoPrincipal ?? null;
    
    this.modalService.open(content, { 
      ariaLabelledBy: 'edit-space-modal', 
      size: 'lg' 
    });
  }

  /**
   * Ouvre la modal de confirmation de suppression
   * @param espace L'espace à supprimer
   */
  openDeleteConfirmation(espace: EspaceDTO): void {
    this.currentEspace = espace;
    this.modalService.open(this.deleteSpaceModal);
  }

  // =============================================
  // SECTION: GESTION DES IMAGES
  // =============================================

  /**
   * Gère la sélection de l'image principale
   * @param event L'événement de sélection de fichier
   */
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

  /**
   * Gère la sélection des images de la galerie
   * @param event L'événement de sélection de fichiers
   */
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

  /**
   * Supprime l'image principale sélectionnée
   * Ajoute l'image à la liste des images à supprimer si elle existe déjà
   */
  removeMainPhoto(): void {
    this.mainPhoto = undefined;
    this.mainPhotoPreview = null;
    if (this.currentEspace?.photoPrincipal) {
      this.imagesToDelete.push(this.currentEspace.photoPrincipal);
    }
  }

  /**
   * Supprime une image de la galerie
   * @param index L'index de l'image à supprimer
   */
  removeGalleryImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  /**
   * Supprime une image existante de la galerie
   * @param index L'index de l'image à supprimer
   */
  removeExistingGalleryImage(index: number): void {
    if (this.currentEspace?.gallery?.[index]) {
      this.imagesToDelete.push(this.currentEspace.gallery[index]);
      this.currentEspace.gallery.splice(index, 1);
    }
  }

  /**
   * Réinitialise la gestion des images
   */
  clearImages(): void {
    this.selectedImages = [];
    this.previewImages = [];
    this.mainPhoto = undefined;
    this.mainPhotoPreview = null;
    this.imagesToDelete = [];
  }

  // =============================================
  // SECTION: CRUD ESPACES
  // =============================================

  /**
   * Ajoute un nouvel espace
   * Valide le formulaire et envoie les données au serveur
   */
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

  /**
   * Met à jour un espace existant
   * Valide le formulaire et envoie les modifications au serveur
   */
  updateEspace(): void {
    if (!this.currentEspace || this.editForm.invalid) {
      this.toastr.warning('Veuillez vérifier les informations', 'Formulaire invalide');
      return;
    }

    this.isUploading = true;

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

  /**
   * Supprime un espace
   * Confirme la suppression via une modal avant l'action
   */
  performDelete(): void {
    if (!this.currentEspace || !this.currentEspace.id) return;

    const deleteObservable = this.currentEspace.type === 'PRIVE'
      ? this.espaceService.deleteEspacePrive(this.currentEspace.id)
      : this.espaceService.deleteEspaceOuvert(this.currentEspace.id);

    deleteObservable.subscribe({
      next: () => {
        this.espaces = this.espaces.filter(e => e.id !== this.currentEspace?.id);
        this.filteredEspaces = this.filteredEspaces.filter(e => e.id !== this.currentEspace?.id);
        this.modalService.dismissAll();
        this.toastr.success('Espace supprimé avec succès', 'Succès');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors de la suppression', 'Erreur');
      }
    });
  }

  /**
   * Bascule le statut actif/inactif d'un espace
   * @param espace L'espace à modifier
   */
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

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Réinitialise les formulaires
   */
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

  /**
   * Retourne la classe CSS pour le badge de type
   * @param type Le type d'espace
   * @returns La classe CSS correspondante
   */
  getTypeBadgeClass(type: string): string {
    return type === 'PRIVE' ? 'bg-primary' : 'bg-success';
  }

  /**
   * Retourne le texte affichable pour le type
   * @param type Le type d'espace
   * @returns Le texte à afficher
   */
  getTypeText(type: string): string {
    return type === 'PRIVE' ? 'Privé' : 'Ouvert';
  }

  /**
   * Retourne la classe CSS pour le badge de statut
   * @param isActive Le statut actif/inactif
   * @returns La classe CSS correspondante
   */
  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  /**
   * Retourne le texte affichable pour le statut
   * @param isActive Le statut actif/inactif
   * @returns Le texte à afficher
   */
  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  /**
   * Retourne le prix par jour formaté ou le type d'accès
   * @param espace L'espace à évaluer
   * @returns Le texte à afficher pour le prix/accès
   */
  getPrixParJour(espace: EspaceDTO): string {
    if (espace.type === 'PRIVE') {
      const priveEspace = espace as EspacePriveDTO;
      
      if (priveEspace.prixParJour && priveEspace.prixParJour > 0) {
        return `${priveEspace.prixParJour} TND/j`;
      }
      
      return 'Gratuit';
    }
    
    return 'Abonnement';
  }
}