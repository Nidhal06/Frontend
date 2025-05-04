import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrivateSpace, Amenity } from '../../../services/space.model';
import { BookingService } from '../../../services/booking.service';
import { BookingDto } from '../../../services/booking.model';
import { AuthService } from '../../../services/auth.service';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ReviewService } from '../../../services/review.service';
import { ReviewDto } from '../../../services/review.model';
import { SubscriptionService, SubscriptionPlan } from '../../../services/subscription.service';
import { SpaceService } from '../../../services/space.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-space-detail',
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css']
})
export class SpaceDetailComponent implements OnInit {
  space: PrivateSpace | null = null;
  loading = true;
  error: string | null = null;
  selectedDate: NgbDateStruct | null = null;
  selectedStartTime: NgbTimeStruct = { hour: 9, minute: 0, second: 0 };
  selectedEndTime: NgbTimeStruct = { hour: 17, minute: 0, second: 0 };
  bookingInProgress = false;
  bookingSuccess = false;
  bookingError: string | null = null;
  subscriptionPlans: SubscriptionPlan[] = [];
  selectedPlan: SubscriptionPlan | null = null;
  showSubscriptionPlans = false;
  safeLocationUrl: SafeResourceUrl | null = null;
  reviews: any[] = [];
  newReview: ReviewDto = {
    spaceId: 0, 
    rating: 5,
    comment: ''
  };
  submittingReview = false;
  userType: string = '';
  billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY';

  constructor(
    private route: ActivatedRoute,
    private spaceService: SpaceService,
    private bookingService: BookingService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private reviewService: ReviewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSpaceDetails(+id);
      this.loadReviews(+id);
      if (this.authService.isLoggedIn()) {
        const user = this.authService.getCurrentUser();
        this.userType = user.roles[0].replace('ROLE_', '').toUpperCase();
        this.loadSubscriptionPlans(+id);
      }
    } else {
      this.error = "Espace non trouvé";
      this.loading = false;
    }
  }

  loadSpaceDetails(id: number): void {
    this.loading = true;
    this.spaceService.getSpaceById(id).subscribe({
        next: (space) => {
            this.space = space;
            this.newReview.spaceId = space.id;

            // Vérifiez si l'espace a une localisation
            if (space.location) {
                // Utilisez l'URL directement pour le lien
                this.safeLocationUrl = space.location; // Utilisation directe de l'URL
            } else {
                this.safeLocationUrl = null; // Pas de localisation disponible
            }
            this.loading = false;
        },
        error: (err) => {
            this.error = "Erreur lors du chargement de l'espace";
            this.loading = false;
            console.error(err);
        }
    });
}

  loadSubscriptionPlans(spaceId: number): void {
    this.subscriptionService.getSubscriptionOptions(spaceId).subscribe({
      next: (plans) => {
        // Filtrer les plans selon le type d'utilisateur
        this.subscriptionPlans = plans.filter(plan => {
          if (this.userType === 'COWORKER') {
            return plan.type === 'INDIVIDUAL';
          } else if (this.userType === 'COMPANY') {
            return plan.type === 'TEAM';
          }
          return false;
        });
      },
      error: (err) => {
        console.error('Error loading subscription plans:', err);
      }
    });
  }

  openImage(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }

  calculateEstimatedPrice(): number {
    if (!this.selectedDate || !this.space) return 0;

    const startDateTime = this.createDateTime(this.selectedDate, this.selectedStartTime);
    const endDateTime = this.createDateTime(this.selectedDate, this.selectedEndTime);

    const durationHours = moment(endDateTime).diff(moment(startDateTime), 'hours', true);

    if (durationHours >= 8) {
      return this.space.pricePerDay;
    } else {
      return this.space.pricePerHour * durationHours;
    }
  }

  loadReviews(spaceId: number): void {
    this.reviewService.getReviewsBySpace(spaceId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  bookSpace(): void {
    if (!this.selectedDate || !this.space) {
      this.bookingError = "Veuillez sélectionner une date";
      return;
    }

    const startDateTime = this.createDateTime(this.selectedDate, this.selectedStartTime);
    const endDateTime = this.createDateTime(this.selectedDate, this.selectedEndTime);

    if (startDateTime >= endDateTime) {
      this.bookingError = "L'heure de fin doit être après l'heure de début";
      return;
    }

    const bookingDto: BookingDto = {
      spaceId: this.space.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    };

    this.bookingInProgress = true;
    this.bookingError = null;

    this.bookingService.createBooking(bookingDto).subscribe({
      next: () => {
        this.bookingInProgress = false;
        this.bookingSuccess = true;
      },
      error: (err) => {
        this.bookingInProgress = false;
        this.bookingError = err.error?.message || "Erreur lors de la réservation";
      }
    });
  }

  private createDateTime(date: NgbDateStruct, time: NgbTimeStruct): Date {
    return new Date(
      date.year,
      date.month - 1,
      date.day,
      time.hour,
      time.minute,
      time.second
    );
  }

  isDateAvailable(date: NgbDateStruct): boolean {
    if (!this.space) return false;
    return true;
  }

  submitReview(): void {
    if (!this.space || !this.newReview.comment) return;

    this.submittingReview = true;
    this.reviewService.createReview({
      spaceId: this.space.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.newReview.comment = '';
        this.newReview.rating = 5;
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.submittingReview = false;
      }
    });
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  toggleSubscriptionPlans(): void {
    this.showSubscriptionPlans = !this.showSubscriptionPlans;
  }

  selectTab(tab: string): void {
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach((t) => {
      t.classList.remove('active');
      const target = t.getAttribute('data-bs-target');
      if (target === `#${tab}`) {
        t.classList.add('active');
      }
    });
  
    const tabContents = document.querySelectorAll('.tab-pane');
    tabContents.forEach((content) => {
      content.classList.remove('show', 'active');
      if (content.id === tab) {
        content.classList.add('show', 'active');
      }
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price);
  }

  getPrice(): number {
    if (!this.selectedPlan) return 0;
    
    const basePrice = this.selectedPlan.price;
    return this.billingCycle === 'YEARLY' ? basePrice * 12 * 0.9 : basePrice;
  }

  subscribe(): void {
    if (!this.selectedPlan || !this.space) return;

    // Implémentez ici la logique de souscription
    console.log('Subscribing to plan:', this.selectedPlan);
    // Vous pouvez appeler un service pour créer l'abonnement
  }
}