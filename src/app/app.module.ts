import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'; 
import { AppRoutingModule } from './app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule , HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthInterceptor } from './services/auth.interceptor';
import { ErrorInterceptor } from './services/error.interceptor';
import { DebugInterceptor } from './services/debug.interceptor';
import { ModalModule } from 'ngx-bootstrap/modal';


// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SpacesComponent } from './pages/spaces/spaces.component';
import { EventsComponent } from './pages/events/events.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SigninComponent } from './pages/signin/signin.component';
import { ForgotpasswordComponent } from './pages/forgotpassword/forgotpassword.component';
import { AdminComponent } from './components/dashboard/admin/admin.component';

import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UsersManagementComponent } from './components/dashboard/admin/users-management/users-management.component';
import { NgbDropdownModule, NgbModule , NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { ProfilComponent } from './components/profil/profil.component';
import { SpacesManagementComponent } from './components/dashboard/admin/spaces-management/spaces-management.component';
import { TruncatePipe } from './services/truncate.pipe';
import { EventsManagementComponent } from './components/dashboard/admin/events-management/events-management.component';
import { FrenchDatePipe } from './components/dashboard/admin/events-management/FrenchDatePipe';
import { SubscriptionsManagementComponent } from './components/dashboard/admin/subscriptions-management/subscriptions-management.component';
import { SpaceDetailComponent } from './pages/spaces/space-detail/space-detail.component';
import { PrivateSpacesComponent } from './pages/spaces/private-spaces/private-spaces.component';
import { OpenSpaceComponent } from './pages/spaces/open-space/open-space.component';
import { UnavailabilityManagementComponent } from './components/dashboard/admin/unavailability-management/unavailability-management.component';
import { ReservationManagementComponent } from './components/dashboard/admin/reservation-management/reservation-management.component';
import { FilterPipe } from './components/dashboard/admin/unavailability-management/filter.pipe';
import { ListReservationComponent } from './components/dashboard/coworker/list-reservation/list-reservation.component';
import { ListReviewComponent } from './components/dashboard/coworker/list-review/list-review.component';
import { CoworkerDashboardComponent } from './components/dashboard/coworker/coworker-dashboard/coworker-dashboard.component';
import { ReceptionisteDashboardComponent } from './components/dashboard/receptioniste/receptioniste-dashboard/receptioniste-dashboard.component';
import { OpenSpaceDetailComponent } from './pages/spaces/open-space/open-space-detail/open-space-detail.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';





@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    SpacesComponent,
    EventsComponent,
    SignupComponent,
    SigninComponent,
    ForgotpasswordComponent,
    AdminComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    UsersManagementComponent,
    ProfilComponent,
    SpacesManagementComponent,
    TruncatePipe,
    EventsManagementComponent,
    FrenchDatePipe,
    SubscriptionsManagementComponent,
    SpaceDetailComponent,
    PrivateSpacesComponent,
    OpenSpaceComponent,
    UnavailabilityManagementComponent,
    ReservationManagementComponent,
    FilterPipe,
    ListReservationComponent,
    ListReviewComponent,
    CoworkerDashboardComponent,
    ReceptionisteDashboardComponent,
    OpenSpaceDetailComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    AppRoutingModule,
    NgbModule,
    NgbDropdownModule,
    RouterModule, 
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FontAwesomeModule,
    NgxPaginationModule,
    NgbTooltipModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    PaginationModule.forRoot(),
    ModalModule.forRoot()
  ],
  exports: [SubscriptionsManagementComponent],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: DebugInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }