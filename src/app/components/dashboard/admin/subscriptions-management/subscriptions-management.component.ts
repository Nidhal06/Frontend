import { Component, OnInit, TemplateRef } from '@angular/core';
import { SubscriptionService, Subscription, SubscriptionPlan } from 'src/app/services/subscription.service';
import { UserService } from 'src/app/services/user.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-subscriptions-management',
  templateUrl: './subscriptions-management.component.html',
  styleUrls: ['./subscriptions-management.component.css']
})
export class SubscriptionsManagementComponent implements OnInit {
  subscriptions: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  modalRef?: BsModalRef;
  subscriptionForm: FormGroup;
  currentSubscriptionId: number | null = null;
  subscriptionTypes = ['INDIVIDUAL', 'TEAM'];
  billingCycles = ['MONTHLY', 'YEARLY'];
  users: any[] = [];
  subscriptionPlans: SubscriptionPlan[] = [];
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL';

  constructor(
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.subscriptionForm = this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      billingCycle: ['', Validators.required],
      maxWorkspaces: ['', [Validators.required, Validators.min(1)]],
      includedHours: ['', [Validators.required, Validators.min(0)]],
      hourlyRate: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadUsers();
    this.loadSubscriptionPlans();
  }

  loadSubscriptions(): void {
    this.subscriptionService.getAllSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.filteredSubscriptions = [...data];
        this.applyFilters();
      },
      error: (err) => this.toastr.error('Erreur lors du chargement des abonnements')
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => this.toastr.error('Erreur lors du chargement des utilisateurs')
    });
  }

  loadSubscriptionPlans(): void {
    this.subscriptionService.getAvailablePlans().subscribe({
      next: (data) => this.subscriptionPlans = data,
      error: (err) => this.toastr.error('Erreur lors du chargement des plans d\'abonnement')
    });
  }

  openAddModal(template: TemplateRef<any>): void {
    this.currentSubscriptionId = null;
    this.subscriptionForm.reset();
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openEditModal(template: TemplateRef<any>, subscription: Subscription): void {
    this.currentSubscriptionId = subscription.id;
    this.subscriptionForm.patchValue({
      userId: subscription.user.id,
      name: subscription.name,
      startDate: moment(subscription.startDate).format('YYYY-MM-DD'),
      endDate: moment(subscription.endDate).format('YYYY-MM-DD'),
      price: subscription.price,
      type: subscription.type,
      billingCycle: subscription.billingCycle,
      maxWorkspaces: subscription.maxWorkspaces,
      includedHours: subscription.includedHours,
      hourlyRate: subscription.hourlyRate
    });
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  saveSubscription(): void {
    if (this.subscriptionForm.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const subscriptionData = this.subscriptionForm.value;

    if (this.currentSubscriptionId) {
      this.subscriptionService.updateSubscription(this.currentSubscriptionId, subscriptionData).subscribe({
        next: () => {
          this.toastr.success('Abonnement mis à jour avec succès');
          this.loadSubscriptions();
          this.modalRef?.hide();
        },
        error: (err) => this.toastr.error('Erreur lors de la mise à jour de l\'abonnement')
      });
    } else {
      this.subscriptionService.createSubscription(subscriptionData).subscribe({
        next: () => {
          this.toastr.success('Abonnement créé avec succès');
          this.loadSubscriptions();
          this.modalRef?.hide();
        },
        error: (err) => this.toastr.error('Erreur lors de la création de l\'abonnement')
      });
    }
  }

  cancelSubscription(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
      this.subscriptionService.cancelSubscription(id).subscribe({
        next: () => {
          this.toastr.success('Abonnement annulé avec succès');
          this.loadSubscriptions();
        },
        error: (err) => this.toastr.error('Erreur lors de l\'annulation de l\'abonnement')
      });
    }
  }

  deleteSubscription(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action est irréversible.')) {
      this.subscriptionService.deleteSubscription(id).subscribe({
        next: () => {
          this.toastr.success('Abonnement supprimé avec succès');
          this.loadSubscriptions();
        },
        error: (err) => this.toastr.error('Erreur lors de la suppression de l\'abonnement')
      });
    }
  }

  applyFilters(): void {
    this.filteredSubscriptions = this.subscriptions.filter(sub => {
      const matchesSearch = this.searchTerm === '' || 
        sub.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sub.user.username.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'ALL' || sub.status === this.statusFilter;
      const matchesType = this.typeFilter === 'ALL' || sub.type === this.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  getTypeName(type: string): string {
    return type === 'INDIVIDUAL' ? 'Individuel' : 'Équipe';
  }
  getBillingCycleName(cycle: string): string {
    return cycle === 'MONTHLY' ? 'Mensuel' : 'Annuel';
  }

  onPlanSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    
    if (selectedIndex > 0) {
        const selectedPlan = this.subscriptionPlans[selectedIndex - 1];
        this.subscriptionForm.patchValue({
            name: selectedPlan.name,
            type: selectedPlan.type,
            billingCycle: selectedPlan.billingCycle,
            price: selectedPlan.price,
            maxWorkspaces: this.getDefaultWorkspaces(selectedPlan.type),
            includedHours: this.getDefaultHours(selectedPlan.type),
            hourlyRate: this.getDefaultHourlyRate(selectedPlan.type)
        });
    }
}

  private getDefaultWorkspaces(type: string): number {
    return type === 'INDIVIDUAL' ? 1 : 5;
  }

  private getDefaultHours(type: string): number {
    return type === 'INDIVIDUAL' ? 80 : 200;
  }

  private getDefaultHourlyRate(type: string): number {
    return type === 'INDIVIDUAL' ? 10 : 15;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'bg-success';
      case 'EXPIRED': return 'bg-secondary';
      case 'CANCELLED': return 'bg-warning';
      case 'PENDING_PAYMENT': return 'bg-danger';
      default: return 'bg-info';
    }
  }

  getFormattedDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY');
  }
}