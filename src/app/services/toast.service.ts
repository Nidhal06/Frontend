import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**
 * Service for displaying toast notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  /**
   * Shows a success toast notification.
   * @param message The message to display.
   * @param title The optional title.
   */
  showSuccess(message: string, title?: string): void {
    this.toastr.success(message, title);
  }

  /**
   * Shows an error toast notification.
   * @param message The message to display.
   * @param title The optional title.
   */
  showError(message: string, title?: string): void {
    this.toastr.error(message, title);
  }
}