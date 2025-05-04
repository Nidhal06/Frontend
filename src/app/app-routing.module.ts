// app-routing.module.ts (version corrigée)
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { EventsComponent } from './pages/events/events.component';
import { PricingComponent } from './pages/pricing/pricing.component';
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

const routes: Routes = [
  // Routes publiques
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'spaces', component: SpacesComponent },
      { path: 'spaces/:id', component: SpaceDetailComponent },
      { path: 'open-spaces', component: OpenSpaceComponent },
      { path: 'private-spaces', component: PrivateSpacesComponent },
      { path: 'events', component: EventsComponent },
      { path: 'plans', component: PricingComponent },
      { path: 'about', component: AboutComponent },
    ]
  },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotpasswordComponent },
  {
    path: 'profile',
    component: ProfilComponent,
    canActivate: [AuthGuard]
  },
  
  // Zone admin
  {
    path: 'admin-dashboard',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', component: AdminComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'spaces', component: SpacesManagementComponent},
      { path: 'events', component: EventsManagementComponent},
      { path: 'subscriptions', component: SubscriptionsManagementComponent}
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