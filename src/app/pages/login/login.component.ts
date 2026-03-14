import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-container animate-fade-in">
      <div class="login-card card">
        <div class="header">
          <h2>Welcome Back</h2>
          <p>Sign in to your PhoneMart account</p>
        </div>

        @if (errorMsg()) {
          <div class="error-msg">
            {{ errorMsg() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" 
                   [(ngModel)]="email" name="email" required 
                   placeholder="admin@phonemart.lk" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" 
                   [(ngModel)]="password" name="password" required 
                   placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-primary w-100" [disabled]="isLoading()">
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="demo-accs">
          <p><strong>Demo Accounts:</strong></p>
          <ul>
            <li>Admin: <code>admin&#64;phonemart.lk</code> / <code>Admin&#64;12345</code></li>
            <li>Owner: <code>kumaran&#64;shop.lk</code> / <code>Shop&#64;123</code></li>
            <li>Owner 2: <code>siva&#64;shop.lk</code> / <code>Shop&#64;123</code></li>
          </ul>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private auth = inject(AuthService);
    private router = inject(Router);

    email = '';
    password = '';

    isLoading = signal(false);
    errorMsg = signal('');

    onSubmit() {
        if (!this.email || !this.password) {
            this.errorMsg.set('Please enter both email and password.');
            return;
        }

        this.isLoading.set(true);
        this.errorMsg.set('');

        this.auth.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
                this.isLoading.set(false);
                // Navigate based on role
                if (this.auth.hasRole('Admin')) {
                    this.router.navigate(['/admin']);
                } else if (this.auth.hasRole('Owner')) {
                    this.router.navigate(['/owner/products']);
                } else {
                    this.router.navigate(['/']);
                }
            },
            error: (err: any) => {
                this.isLoading.set(false);
                console.error(err);
                if (err.status === 401 || err.status === 400) {
                    this.errorMsg.set('Invalid email or password.');
                } else {
                    this.errorMsg.set('An error occurred. Please try again later.');
                }
            }
        });
    }
}
