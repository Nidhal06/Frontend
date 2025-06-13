import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Third-party Modules
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgbDropdownModule, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

// Application Modules
import { AppRoutingModule } from './app-routing.module';

// Interceptors
import { AuthInterceptor } from './services/auth.interceptor';
import { ErrorInterceptor } from './services/error.interceptor';
import { DebugInterceptor } from './services/debug.interceptor';

// Components
import { AppComponent } from './app.component';

// Layout Components
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

// Page Components
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SpacesComponent } from './pages/spaces/spaces.component';
import { EventsComponent } from './pages/events/events.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SigninComponent } from './pages/signin/signin.component';
import { ForgotpasswordComponent } from './pages/forgotpassword/forgotpassword.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

// Space Components
import { SpaceDetailComponent } from './pages/spaces/space-detail/space-detail.component';
import { PrivateSpacesComponent } from './pages/spaces/private-spaces/private-spaces.component';
import { OpenSpaceComponent } from './pages/spaces/open-space/open-space.component';
import { OpenSpaceDetailComponent } from './pages/spaces/open-space/open-space-detail/open-space-detail.component';

// Dashboard Components
import { AdminComponent } from './components/dashboard/admin/admin.component';
import { UsersManagementComponent } from './components/dashboard/admin/users-management/users-management.component';
import { SpacesManagementComponent } from './components/dashboard/admin/spaces-management/spaces-management.component';
import { EventsManagementComponent } from './components/dashboard/admin/events-management/events-management.component';
import { SubscriptionsManagementComponent } from './components/dashboard/admin/subscriptions-management/subscriptions-management.component';
import { UnavailabilityManagementComponent } from './components/dashboard/admin/unavailability-management/unavailability-management.component';
import { ReservationManagementComponent } from './components/dashboard/admin/reservation-management/reservation-management.component';
import { CoworkerDashboardComponent } from './components/dashboard/coworker/coworker-dashboard/coworker-dashboard.component';
import { ReceptionisteDashboardComponent } from './components/dashboard/receptioniste/receptioniste-dashboard/receptioniste-dashboard.component';
import { ListReservationComponent } from './components/dashboard/coworker/list-reservation/list-reservation.component';
import { ListReviewComponent } from './components/dashboard/coworker/list-review/list-review.component';

// Shared Components
import { ProfilComponent } from './components/profil/profil.component';

// Pipes
import { TruncatePipe } from './services/truncate.pipe';
import { FrenchDatePipe } from './components/dashboard/admin/events-management/FrenchDatePipe';
import { FilterPipe } from './components/dashboard/admin/unavailability-management/filter.pipe';

/**
 * Main application module that declares all components, pipes, and imports required modules.
 */
@NgModule({
  declarations: [
    // Root Component
    AppComponent,
    
    // Layout Components
    NavbarComponent,
    FooterComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    
    // Page Components
    HomeComponent,
    AboutComponent,
    SpacesComponent,
    EventsComponent,
    SignupComponent,
    SigninComponent,
    ForgotpasswordComponent,
    ResetPasswordComponent,
    
    // Space Components
    SpaceDetailComponent,
    PrivateSpacesComponent,
    OpenSpaceComponent,
    OpenSpaceDetailComponent,
    
    // Dashboard Components
    AdminComponent,
    UsersManagementComponent,
    SpacesManagementComponent,
    EventsManagementComponent,
    SubscriptionsManagementComponent,
    UnavailabilityManagementComponent,
    ReservationManagementComponent,
    CoworkerDashboardComponent,
    ReceptionisteDashboardComponent,
    ListReservationComponent,
    ListReviewComponent,
    
    // Shared Components
    ProfilComponent,
    
    // Pipes
    TruncatePipe,
    FrenchDatePipe,
    FilterPipe
  ],
  imports: [
    // Angular Modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    RouterModule,
    
    // Application Routing
    AppRoutingModule,
    
    // Angular Material Modules
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    
    // Third-party Modules
    FontAwesomeModule,
    NgxChartsModule,
    NgbModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgxPaginationModule,
    
    // Toastr configuration
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    
    // Pagination configuration
    PaginationModule.forRoot(),
    
    // Modal configuration
    ModalModule.forRoot()
  ],
  exports: [
    SubscriptionsManagementComponent
  ],
  providers: [
    // HTTP Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: DebugInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }