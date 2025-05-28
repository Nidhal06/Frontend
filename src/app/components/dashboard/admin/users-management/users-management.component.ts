import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '../../../../types/entities';
import { ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  isLoading = true;
  searchQuery = '';
  currentUser: UserDTO | null = null;
  userForm: FormGroup;
  editForm: FormGroup;
  
  roles = [
    { value: 'ADMIN', display: 'Administrateur' },
    { value: 'COWORKER', display: 'Coworker' },
    { value: 'RECEPTIONISTE', display: 'Réceptionniste' },
  ];

  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;
   private userIdToDelete: number | null = null;

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
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

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
        this.toastr.error('Impossible de charger les utilisateurs', 'Erreur');
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
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
  }

  openAddModal(content: any): void {
    this.userForm.reset({
      type: 'COWORKER',
      enabled: true
    });
    this.modalService.open(content, { ariaLabelledBy: 'add-user-modal', size: 'lg' });
  }

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
    this.modalService.open(content, { ariaLabelledBy: 'edit-user-modal', size: 'lg' });
  }

  addUser(): void {
    if (this.userForm.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires correctement', 'Formulaire invalide');
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
        this.toastr.error(err.error?.message || 'Erreur lors de la création', 'Erreur');
      }
    });
  }

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
        this.toastr.error(err.error?.message || 'Erreur lors de la mise à jour', 'Erreur');
      }
    });
  }

  // Ouvre la modal de confirmation
openDeleteModal(id: number): void {
  this.userIdToDelete = id;
  this.modalService.open(this.deleteModal, { centered: true });
}

// Confirmation de suppression
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
      this.toastr.error(err.error?.message || 'Erreur lors de la suppression', 'Erreur');
    }
  });
}

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
        this.toastr.error(err.error?.message || 'Erreur lors de la modification', 'Erreur');
      }
    });
  }

  getRoleBadgeClass(type: string): string {
    switch (type) {
      case 'ADMIN': return 'bg-danger';
      case 'RECEPTIONISTE': return 'bg-primary';
      case 'COWORKER':
      default: return 'bg-secondary';
    }
  }

  getRoleDisplayName(type: string): string {
    const role = this.roles.find(r => r.value === type);
    return role ? role.display : type;
  }
}