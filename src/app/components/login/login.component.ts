import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  apiKey: string = '';
  isSubmitting: boolean = false;
  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login(): void {
    if (!this.apiKey.trim()) {
      this.notificationService.error('API key is required');
      return;
    }

    this.isSubmitting = true;

    // In a real app, you might want to validate the API key with a backend call
    // Here we'll just set it directly
    try {
      this.authService.setApiKey(this.apiKey.trim());
      this.notificationService.success('Login successful');
      this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      this.notificationService.error('Failed to set API key');
      console.error('Login error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
