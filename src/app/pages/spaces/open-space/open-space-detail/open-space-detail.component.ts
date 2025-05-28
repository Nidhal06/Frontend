import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EspaceOuvertDTO, AvisDTO, UserDTO } from '../../../../types/entities';
import { EspaceService } from '../../../../services/espace.service';
import { AuthService } from '../../../../services/auth.service';
import { AvisService } from '../../../../services/avis.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../services/user.service';
import { environment } from 'src/app/services/environments/environment';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-open-space-detail',
  templateUrl: './open-space-detail.component.html',
  styleUrls: ['./open-space-detail.component.css']
})
export class OpenSpaceDetailComponent implements OnInit {
  @ViewChild('lightboxModal') lightboxModalEl!: ElementRef;
  lightboxModal?: Modal;
  
  environment = environment;
  space: EspaceOuvertDTO | null = null;
  loading = true;
  error: string | null = null;
  currentUser: UserDTO | null = null;
  safeLocationUrl: SafeResourceUrl | null = null;

  // Review properties
  reviews: AvisDTO[] = [];
  newReview: { rating: number, commentaire: string } = { rating: 0, commentaire: '' };
  submittingReview = false;

  // Gallery properties
  currentImageIndex = 0;
  galleryImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private espaceService: EspaceService,
    private authService: AuthService,
    private avisService: AvisService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.safeLocationUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://maps.app.goo.gl/u8s9KhVP8uh71Gdf7'
      );
      const spaceId = parseInt(id);
      this.loadSpaceDetails(spaceId);
      this.loadReviews(spaceId);
      
      if (this.authService.isLoggedIn() && this.authService.getCurrentUserId()) {
        const userId = this.authService.getCurrentUserId()!;
        this.loadCurrentUser(userId);
      }
    } else {
      this.error = 'ID de l\'espace non spécifié';
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    this.lightboxModal = new Modal(this.lightboxModalEl.nativeElement);
  }

  loadSpaceDetails(id: number): void {
    this.loading = true;
    this.espaceService.getEspaceOuvertById(id).subscribe({
      next: (space) => {
        let cleanedPhoto = space.photoPrincipal;
        if (cleanedPhoto) {
          cleanedPhoto = cleanedPhoto.replace(/^http:\/\/localhost:1010/, '');
          if (!cleanedPhoto.startsWith('/')) {
            cleanedPhoto = '/' + cleanedPhoto;
          }
        }

        const galleryUrls = space.gallery?.map(image => {
          if (image) {
            let cleanedImage = image.replace(/^http:\/\/localhost:1010/, '');
            if (!cleanedImage.startsWith('/')) {
              cleanedImage = '/' + cleanedImage;
            }
            return `${environment.apiUrl}${cleanedImage}`;
          } else {
            return 'assets/images/default-gallery.jpg';
          }
        }) || [];

        this.space = {
          ...space,
          photoPrincipal: cleanedPhoto
            ? `${environment.apiUrl}${cleanedPhoto}`
            : 'assets/images/default-space.jpg',
          gallery: galleryUrls
        };

        // Initialize gallery images
        this.galleryImages = [this.space.photoPrincipal, ...galleryUrls];
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails de l\'espace';
        this.loading = false;
        this.toastr.error(this.error, 'Erreur');
      }
    });
  }

  loadReviews(spaceId: number): void {
    this.avisService.getAvisByEspaceId(spaceId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des avis', 'Erreur');
      }
    });
  }

  loadCurrentUser(userId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Veuillez vous connecter', 'Authentification requise');
      return;
    }
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.toastr.error('Erreur lors du chargement des informations utilisateur', 'Erreur');
      }
    });
  }

  // Lightbox functionality
  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.lightboxModal?.show();
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
  }

  submitReview(): void {
    if (!this.space || !this.newReview.rating || !this.newReview.commentaire) {
      this.toastr.warning('Veuillez donner une note et un commentaire', 'Avis incomplet');
      return;
    }

    if (!this.authService.getCurrentUserId() || !this.currentUser) {
      this.toastr.warning('Veuillez vous connecter pour poster un avis', 'Connexion requise');
      return;
    }

    this.submittingReview = true;

    const newAvis: AvisDTO = {
      userId: this.authService.getCurrentUserId()!,
      userUsername: this.currentUser.username,
      userFirstName: this.currentUser.firstName,
      userLastName: this.currentUser.lastName,
      espaceId: this.space.id!,
      espaceName: this.space.name,
      espaceType: this.space.type,
      rating: this.newReview.rating,
      commentaire: this.newReview.commentaire,
      date: new Date()
    };

    this.avisService.createAvis(newAvis).subscribe({
      next: (createdAvis) => {
        this.reviews.unshift(createdAvis);
        this.newReview = { rating: 0, commentaire: '' };
        this.submittingReview = false;
        this.toastr.success('Votre avis a été publié', 'Merci !');
      },
      error: (err) => {
        this.submittingReview = false;
        this.toastr.error('Erreur lors de la publication de votre avis', 'Erreur');
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isCurrentUserAdmin(): boolean {
    return this.authService.isAdmin();
  }

  deleteReview(reviewId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.avisService.deleteAvis(reviewId).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.toastr.success('Avis supprimé avec succès', 'Succès');
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la suppression de l\'avis', 'Erreur');
        }
      });
    }
  }
}