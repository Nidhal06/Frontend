import { Component, OnInit } from '@angular/core';
import { SubscriptionService, SubscriptionPlan } from 'src/app/services/subscription.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  individualMonthlyPlans: SubscriptionPlan[] = [];
  individualYearlyPlans: SubscriptionPlan[] = [];
  teamMonthlyPlans: SubscriptionPlan[] = [];
  teamYearlyPlans: SubscriptionPlan[] = [];
  isLoggedIn = false;
  userType: string = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadPlans();
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.userType = user.roles[0].replace('ROLE_', '').toUpperCase();
    }
  }

  loadPlans(): void {
    this.subscriptionService.getAvailablePlans().subscribe({
      next: (plans) => {
        this.individualMonthlyPlans = plans.filter(p => 
          p.type === 'INDIVIDUAL' && p.billingCycle === 'MONTHLY');
        this.individualYearlyPlans = plans.filter(p => 
          p.type === 'INDIVIDUAL' && p.billingCycle === 'YEARLY');
        this.teamMonthlyPlans = plans.filter(p => 
          p.type === 'TEAM' && p.billingCycle === 'MONTHLY');
        this.teamYearlyPlans = plans.filter(p => 
          p.type === 'TEAM' && p.billingCycle === 'YEARLY');
      },
      error: (err) => this.toastr.error('Erreur lors du chargement des plans')
    });
  }

  scrollToPricing(): void {
    const element = document.getElementById('pricing-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  subscribe(planType: string, billingCycle: string): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/signin'], { queryParams: { returnUrl: '/subscriptions' } });
      return;
    }
    
    this.router.navigate(['/profile'], { 
      queryParams: { 
        subscribe: planType,
        cycle: billingCycle
      } 
    });
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price);
  }
}