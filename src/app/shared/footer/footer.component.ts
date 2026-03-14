import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          
          <div class="footer-brand">
            <h2 class="brand-text">
              <span class="brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </span>
              PhoneMart
            </h2>
            <p class="brand-desc">Sri Lanka's premium marketplace for mobile phones, accessories, and spare parts. Connect with verified shops nationwide.</p>
          </div>

          <div class="footer-links-group">
            <h3 class="group-title">Marketplace</h3>
            <ul class="links-list">
              <li><a routerLink="/">All Phones</a></li>
              <li><a routerLink="/">Accessories</a></li>
              <li><a routerLink="/">Spare Parts</a></li>
              <li><a routerLink="/">Verified Shops</a></li>
            </ul>
          </div>

          <div class="footer-links-group">
            <h3 class="group-title">For Shops</h3>
            <ul class="links-list">
              <li><a routerLink="/login">Login to Dashboard</a></li>
              <li><a routerLink="/login">Manage Stock</a></li>
              <li><a routerLink="/wholesale">B2B Wholesale</a></li>
            </ul>
          </div>

          <div class="footer-links-group">
            <h3 class="group-title">Support</h3>
            <ul class="links-list">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <p class="copyright">&copy; {{ currentYear }} PhoneMart. All rights reserved.</p>
          
          <div class="social-links">
            <a href="#" class="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" class="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" class="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    currentYear = new Date().getFullYear();
}
