import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-wholesale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="marketplace animate-fade-in">
    <div class="marketplace animate-fade-in">
      <div class="hero wholesale-hero mb-4">
        <div class="hero-container">
          <div class="hero-content">
            <span class="hero-badge">B2B Trade for Shop Owners</span>
            <h1 class="title-glow">Wholesale Marketplace</h1>
            <p class="hero-subtitle">Source devices and parts directly from verified suppliers at wholesale prices.</p>
            
            <div class="hero-search-box">
              <div class="search-input-group">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <select class="form-control search-select" [(ngModel)]="selectedItemType">
                  <option value="">All Types</option>
                  <option value="1">Phones</option>
                  <option value="3">Parts</option>
                  <option value="2">Accessories</option>
                </select>
              </div>
              <div class="search-divider"></div>
              <div class="search-input-group">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <select class="form-control search-select" [(ngModel)]="selectedCity">
                  <option value="">All Cities</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                </select>
              </div>
              <button class="btn btn-primary btn-search" (click)="search()">Filter Listings</button>
            </div>
          </div>
          
          <div class="hero-image-wrapper">
            <div class="hero-glow"></div>
            <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400" alt="Bulk Phones" class="hero-phone-img">
          </div>
        </div>
      </div>

      <div class="results-section">
        @if (isLoading()) {
          <div class="loader">Loading wholesale listings...</div>
        } @else if (listings().length === 0) {
          <div class="empty-state">No wholesale listings match your filters.</div>
        } @else {
          <div class="grid animate-fade-in">
            @for (l of listings(); track l.id) {
              <div class="card wholesale-card">
                <div class="wholesale-card-top">
                  @if (l.imageUrl && !l.imageBroken) {
                    <img [src]="l.imageUrl" [alt]="l.title" class="product-image"
                         style="width: 100%; height: 200px; object-fit: cover; border-top-left-radius: 12px; border-top-right-radius: 12px;"
                         (error)="onImageError($event, l)">
                  } @else {
                    <div class="product-image-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                    </div>
                  }
                  <span class="badge" [class.badge-new]="l.itemType === 'Phone'" 
                                     [class.badge-active]="l.itemType !== 'Phone'">
                    {{ l.itemType }}
                  </span>
                </div>
                
                <div class="wholesale-card-body">
                  <h3 class="product-title">{{ l.title }}</h3>
                  
                  <div class="wholesale-details">
                    <div class="detail-row">
                      <span>Unit Price:</span>
                      <strong>LKR {{ l.unitPrice | number:'1.2-2' }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Min Order:</span>
                      <strong>{{ l.minOrderQty }} units</strong>
                    </div>
                    <div class="detail-row">
                      <span>Available:</span>
                      <strong>{{ l.availableQty }} units</strong>
                    </div>
                  </div>
                </div>
                
                <div class="wholesale-card-footer">
                  <div class="shop-info-row">
                    <div class="shop-details">
                      <div class="shop-name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                        {{ l.sellerShopName }}
                      </div>
                    </div>
                  </div>
                  <div class="contact-actions">
                    <a [href]="'https://wa.me/' + l.sellerWhatsApp" target="_blank" class="contact-btn btn-wa">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Contact Supplier
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./wholesale.component.scss']
})
export class WholesaleComponent implements OnInit {
  private api = inject(ApiService);

  listings = signal<any[]>([]);
  isLoading = signal(true);

  selectedItemType = '';
  selectedCity = '';

  ngOnInit() {
    this.search();
  }

  search() {
    this.isLoading.set(true);
    this.api.getAllWholesale(this.selectedItemType || undefined, this.selectedCity || undefined)
      .subscribe({
        next: (data) => {
          this.listings.set(data);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  onImageError(event: any, listing: any) {
    event.target.style.display = 'none';
    listing.imageBroken = true;
    this.listings.set([...this.listings()]);
  }
}
