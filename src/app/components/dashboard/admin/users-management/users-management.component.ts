import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

// Services
import { UserService } from '../../../../services/user.service';

// Models
import { UserDTO } from '../../../../types/entities';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  // =============================================
  // SECTION: PROPRIÉTÉS DU COMPOSANT
  // =============================================

  // Données utilisateurs
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  currentUser: UserDTO | null = null;
  
  // État du composant
  isLoading = true;
  searchQuery = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  // Configuration des rôles
  roles = [
    { value: 'ADMIN', display: 'Administrateur' },
    { value: 'COWORKER', display: 'Coworker' },
    { value: 'RECEPTIONISTE', display: 'Réceptionniste' },
  ];

  // Référence à la modal de suppression
  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;
  private userIdToDelete: number | null = null;

  // Formulaires
  userForm: FormGroup;
  editForm: FormGroup;

  // =============================================
  // SECTION: INITIALISATION
  // =============================================

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    // Initialisation du formulaire d'ajout
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      type: ['COWORKER', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      enabled: [true]
    });

    // Initialisation du formulaire d'édition
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      type: ['COWORKER', Validators.required],
      password: [''],
      enabled: [true]
    });
  }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  // =============================================
  // SECTION: CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge la liste des utilisateurs depuis l'API
   */
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.totalItems = this.filteredUsers.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
        this.toastr.error('Impossible de charger les utilisateurs', 'Erreur');
      }
    });
  }

  // =============================================
  // SECTION: PAGINATION ET FILTRAGE
  // =============================================

  /**
   * Gère le changement de page
   * @param event - Le numéro de la nouvelle page
   */
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  /**
   * Filtre les utilisateurs selon la recherche
   */
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
      this.totalItems = this.filteredUsers.length;
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      (user.username?.toLowerCase().includes(query)) ||
      (user.email?.toLowerCase().includes(query)) ||
      (user.firstName?.toLowerCase().includes(query)) ||
      (user.lastName?.toLowerCase().includes(query)) ||
      (user.phone?.includes(query)) ||
      (user.type?.toLowerCase().includes(query))
    );
    this.totalItems = this.filteredUsers.length;
    this.currentPage = 1;
  }

  /**
   * Retourne les utilisateurs paginés pour l'affichage
   */
  get paginatedUsers(): UserDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcule l'index du premier élément de la page
   */
  getMinItemIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // =============================================
  // SECTION: GESTION DES MODALS
  // =============================================

  /**
   * Ouvre la modal d'ajout d'utilisateur
   * @param content - Le template de la modal
   */
  openAddModal(content: any): void {
    this.userForm.reset({
      type: 'COWORKER',
      enabled: true
    });
    this.modalService.open(content, { 
      ariaLabelledBy: 'add-user-modal', 
      size: 'lg' 
    });
  }

  /**
   * Ouvre la modal d'édition d'utilisateur
   * @param content - Le template de la modal
   * @param user - L'utilisateur à éditer
   */
  openEditModal(content: any, user: UserDTO): void {
    this.currentUser = user;
    this.editForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      type: user.type,
      enabled: user.enabled
    });
    this.modalService.open(content, { 
      ariaLabelledBy: 'edit-user-modal', 
      size: 'lg' 
    });
  }

  /**
   * Ouvre la modal de confirmation de suppression
   * @param id - L'ID de l'utilisateur à supprimer
   */
  openDeleteModal(id: number): void {
    this.userIdToDelete = id;
    this.modalService.open(this.deleteModal, { centered: true });
  }

  // =============================================
  // SECTION: CRUD UTILISATEURS
  // =============================================

  /**
   * Ajoute un nouvel utilisateur
   */
  addUser(): void {
    if (this.userForm.invalid) {
      this.toastr.warning(
        'Veuillez remplir tous les champs obligatoires correctement', 
        'Formulaire invalide'
      );
      return;
    }

    const newUser: UserDTO = {
      ...this.userForm.value,
      profileImagePath: ''
    };

    this.userService.createUser(newUser).subscribe({
      next: (createdUser) => {
        this.users.push(createdUser);
        this.filteredUsers = [...this.users];
        this.modalService.dismissAll();
        this.toastr.success('Utilisateur créé avec succès', 'Succès');
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.toastr.error(
          err.error?.message || 'Erreur lors de la création', 
          'Erreur'
        );
      }
    });
  }

  /**
   * Met à jour un utilisateur existant
   */
  updateUser(): void {
    if (!this.currentUser || this.editForm.invalid) {
      this.toastr.warning('Veuillez vérifier les informations', 'Formulaire invalide');
      return;
    }

    const updatedData: UserDTO = {
      ...this.editForm.value,
      id: this.currentUser.id,
      profileImagePath: this.currentUser.profileImagePath
    };

    // Ne pas envoyer le mot de passe s'il n'est pas modifié
    if (!updatedData.password) {
      delete updatedData.password;
    }

    this.userService.updateUser(this.currentUser.id!, updatedData).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filteredUsers = [...this.users];
        }
        this.modalService.dismissAll();
        this.toastr.success('Utilisateur mis à jour', 'Succès');
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.toastr.error(
          err.error?.message || 'Erreur lors de la mise à jour', 
          'Erreur'
        );
      }
    });
  }

  /**
   * Confirme la suppression d'un utilisateur
   */
  confirmDelete(): void {
    if (!this.userIdToDelete) return;
    
    const id = this.userIdToDelete;
    this.modalService.dismissAll();
    
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== id);
        this.toastr.success('Utilisateur supprimé avec succès', 'Succès');
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Erreur lors de la suppression', 
          'Erreur'
        );
      }
    });
  }

  /**
   * Bascule le statut activé/désactivé d'un utilisateur
   * @param user - L'utilisateur à modifier
   */
  toggleUserStatus(user: UserDTO): void {
    this.userService.toggleUserStatus(user.id!).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index].enabled = updatedUser.enabled;
          this.filteredUsers = [...this.users];
        }
        this.toastr.success('Statut utilisateur mis à jour', 'Succès');
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Erreur lors de la modification', 
          'Erreur'
        );
      }
    });
  }

  // =============================================
  // SECTION: MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Retourne la classe CSS pour le badge de rôle
   * @param type - Le type de rôle
   */
  getRoleBadgeClass(type: string): string {
    switch (type) {
      case 'ADMIN': return 'bg-danger';
      case 'RECEPTIONISTE': return 'bg-primary';
      case 'COWORKER':
      default: return 'bg-secondary';
    }
  }

  /**
   * Retourne le nom affichable d'un rôle
   * @param type - Le type de rôle
   */
  getRoleDisplayName(type: string): string {
    const role = this.roles.find(r => r.value === type);
    return role ? role.display : type;
  }
}