import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;
  searchQuery = '';
  currentUser: any = null;
  userForm: FormGroup;
  editForm: FormGroup;
  roles = [
    { value: 'ADMIN', display: 'Administrateur' },
    { value: 'COWORKER', display: 'Coworker' },
    { value: 'COMPANY', display: 'Entreprise' },
    { value: 'RECEPTIONIST', display: 'Réceptionniste' },
    { value: 'ACCOUNTANT', display: 'Comptable' }
  ];

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: ['', [Validators.pattern(/^[0-9]{8}$/)]], 
      type: ['COWORKER', Validators.required],
      password: ['', Validators.required],
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
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs', 'error');
      }
    });
  }

  onSearchChange(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredUsers = [...this.users];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.type && user.type.toLowerCase().includes(query))
      );
    }
  }

  openAddModal(content: any): void {
    this.userForm.reset({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      type: 'COWORKER',
      password: '',
      enabled: true
    });
    this.modalService.open(content, { ariaLabelledBy: 'add-user-modal' });
  }

  openEditModal(content: any, user: any): void {
    this.currentUser = user;
    this.editForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      type: user.type,
      enabled: user.enabled,
      password: ''
    });
    this.modalService.open(content, { ariaLabelledBy: 'edit-user-modal' });
  }

addUser(): void {
  if (this.userForm.invalid) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  this.userService.createUser(this.userForm.value).subscribe({
    next: (newUser) => {
      this.users.push(newUser);
      this.filteredUsers = [...this.users];
      this.modalService.dismissAll();
      Swal.fire('Succès', 'Utilisateur créé avec succès', 'success');
    },
    error: (err) => {
      console.error('Error creating user:', err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de création',
        text: err.message || 'Erreur lors de la création de l\'utilisateur',
        confirmButtonText: 'OK'
      });
    }
  });
}

  updateUser(): void {
    if (!this.currentUser) {
      Swal.fire('Erreur', 'Utilisateur non sélectionné', 'error');
      return;
    }
  
    // Valider uniquement les champs requis
    if (this.editForm.get('username')?.invalid || this.editForm.get('email')?.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Champs requis',
        text: 'Veuillez remplir correctement les champs obligatoires (nom d\'utilisateur et email)',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    const userData = {
      username: this.editForm.get('username')?.value,
      email: this.editForm.get('email')?.value,
      firstName: this.editForm.get('firstName')?.value || null,
      lastName: this.editForm.get('lastName')?.value || null,
      phone: this.editForm.get('phone')?.value || null,
      type: this.editForm.get('type')?.value,
      enabled: this.editForm.get('enabled')?.value,
      password: this.editForm.get('password')?.value || undefined
    };
  
    this.userService.updateUser(this.currentUser.id, userData).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filteredUsers = [...this.users];
        }
        this.modalService.dismissAll();
        Swal.fire('Succès', 'Utilisateur mis à jour avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        let errorMessage = 'Une erreur est survenue lors de la mise à jour';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
  
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    });
  }
  
  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Cette action est irréversible et supprimera toutes les données associées!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== userId);
            this.filteredUsers = this.filteredUsers.filter(u => u.id !== userId);
            Swal.fire('Supprimé!', 'L\'utilisateur a été supprimé.', 'success');
          },
          error: (err) => {
            const errorMsg = err.error?.message || err.message || 'Erreur lors de la suppression';
            Swal.fire('Erreur', errorMsg, 'error');
          }
        });
      }
    });
  }
  
  toggleUserStatus(user: any): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index].enabled = updatedUser.enabled;
          this.filteredUsers = [...this.users];
        }
        Swal.fire('Succès', 'Statut utilisateur mis à jour', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Erreur lors de la modification du statut';
        Swal.fire('Erreur', errorMsg, 'error');
      }
    });
  }
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-danger text-white';
      case 'RECEPTIONIST': return 'bg-primary text-white';
      case 'ACCOUNTANT': return 'bg-purple text-white';
      case 'COMPANY': return 'bg-success text-white';
      case 'COWORKER':
      default: return 'bg-secondary text-white';
    }
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'COWORKER': return 'Coworker';
      case 'COMPANY': return 'Entreprise';
      case 'RECEPTIONIST': return 'Réceptionniste';
      case 'ACCOUNTANT': return 'Comptable';
      default: return role;
    }
  }
}