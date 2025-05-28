
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { EventsComponent } from './pages/events/events.component';
import { SpacesComponent } from './pages/spaces/spaces.component';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgotpasswordComponent } from './pages/forgotpassword/forgotpassword.component';
import { AdminComponent } from './components/dashboard/admin/admin.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { UsersManagementComponent } from './components/dashboard/admin/users-management/users-management.component';
import { AdminGuard } from './services/admin.guard';
import { AuthGuard } from './services/auth.guard';
import { ProfilComponent } from './components/profil/profil.component';
import { SpacesManagementComponent } from './components/dashboard/admin/spaces-management/spaces-management.component';
import { SpaceDetailComponent } from './pages/spaces/space-detail/space-detail.component';
import { EventsManagementComponent } from './components/dashboard/admin/events-management/events-management.component';
import { SubscriptionsManagementComponent } from './components/dashboard/admin/subscriptions-management/subscriptions-management.component';
import { OpenSpaceComponent } from './pages/spaces/open-space/open-space.component';
import { PrivateSpacesComponent } from './pages/spaces/private-spaces/private-spaces.component';
import { UnavailabilityManagementComponent } from './components/dashboard/admin/unavailability-management/unavailability-management.component';
import { ReservationManagementComponent } from './components/dashboard/admin/reservation-management/reservation-management.component';
import { ListReservationComponent } from './components/dashboard/coworker/list-reservation/list-reservation.component';
import { CoworkerDashboardComponent } from './components/dashboard/coworker/coworker-dashboard/coworker-dashboard.component';
import { ListReviewComponent } from './components/dashboard/coworker/list-review/list-review.component';
import { ReceptionisteDashboardComponent } from './components/dashboard/receptioniste/receptioniste-dashboard/receptioniste-dashboard.component';
import { OpenSpaceDetailComponent } from './pages/spaces/open-space/open-space-detail/open-space-detail.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  // Routes publiques
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'spaces', component: SpacesComponent },
      { path: 'spaces/:id', component: SpaceDetailComponent },
      { path: 'openspace/:id', component: OpenSpaceDetailComponent },
      { path: 'open-spaces', component: OpenSpaceComponent },
      { path: 'private-spaces', component: PrivateSpacesComponent },
      { path: 'events', component: EventsComponent },
      { path: 'about', component: AboutComponent },
      
      // Zone coworker
      { path: 'coworker-dashboard/check-spaces', component: SpacesComponent , canActivate: [AuthGuard] },
      { path: 'coworker-dashboard/check-events', component: EventsComponent , canActivate: [AuthGuard] },
    ]
  },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotpasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'profile',
    component: ProfilComponent,
    canActivate: [AuthGuard]
  },

  // Zone réceptionniste
  { path: 'receptioniste-dashboard', component: ReceptionisteDashboardComponent , canActivate: [AuthGuard] },

  // Zone coworker
  { path: 'coworker-dashboard', component: CoworkerDashboardComponent , canActivate: [AuthGuard] },
  { path: 'coworker-dashboard/my-bookings', component: ListReservationComponent , canActivate: [AuthGuard] },
  { path: 'coworker-dashboard/my-feedbacks', component: ListReviewComponent , canActivate: [AuthGuard] },
  
  // Zone admin
  {
    path: 'admin-dashboard',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: AdminComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'spaces', component: SpacesManagementComponent},
      { path: 'events', component: EventsManagementComponent},
      { path: 'subscriptions', component: SubscriptionsManagementComponent},
      { path: 'blackout-periods', component: UnavailabilityManagementComponent},
      { path: 'reservations', component: ReservationManagementComponent}
    ]
  },

  

  // Redirection pour les routes inconnues
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }