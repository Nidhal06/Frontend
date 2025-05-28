import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../services/environments/environment';
import { ProfilDto } from '../../types/entities';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  profileForm: FormGroup;
  userProfile: any;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;
  isEditing = false;
  environment = environment;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      username: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          username: profile.username
        });
        this.previewUrl = profile.profileImagePath 
          ? `${environment.apiUrl}${profile.profileImagePath}` 
          : 'assets/images/default-avatar.png';
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load profile', 'Error');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  uploadImage(): void {
  if (this.selectedFile && this.userProfile) {
    this.isLoading = true;
    this.profileService.uploadProfileImage(this.selectedFile).subscribe({
      next: (response: any) => {
        // Handle both string response and object responses
        const imagePath = typeof response === 'string' ? response : response?.path;
        
        if (!imagePath) {
          throw new Error('No image path returned');
        }

        this.toastr.success('Profile image updated successfully', 'Success');
        this.userProfile!.profileImagePath = imagePath;
        this.previewUrl = `${environment.apiUrl}${imagePath}`;
        this.selectedFile = null;
        this.isLoading = false;
        
        // Notify other components
        const updatedUser = {
          ...this.userProfile!,
          profileImagePath: imagePath
        };
        this.profileService.notifyProfileUpdate(updatedUser);
      },
      error: (err) => {
        console.error('Full upload error:', err);
        const errorMessage = err.message || 'Failed to update profile image';
        this.toastr.success('Profile image updated successfully', 'Success');
        this.isLoading = false;
      }
    });
  }
}

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
      this.profileForm.get('username')?.disable();
    } else {
      this.profileForm.disable();
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.userProfile) {
      this.isLoading = true;
      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.toastr.success('Profile updated successfully', 'Success');
          this.isEditing = false;
          this.profileForm.disable();
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Failed to update profile', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  getRoleDisplayName(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }

  getUserTypeDisplayName(type: string): string {
    switch(type) {
      case 'ADMIN': return 'Administrator';
      case 'COWORKER': return 'Coworker';
      case 'RECEPTIONIST': return 'Receptionist';
      default: return type;
    }
  }
}