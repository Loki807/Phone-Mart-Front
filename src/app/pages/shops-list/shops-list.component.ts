import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-shops-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="shops-directory animate-fade-in">
      <div class="hero">
        <div class="hero-container">
          <div class="hero-content">
            <span class="hero-badge">Verified Partners</span>
            <h1 class="title-glow">Our Shops</h1>
            <p class="hero-subtitle">Browse and connect directly with trusted local mobile phone shops across Sri Lanka.</p>
            
            <div class="hero-search-box">
              <div class="search-input-group" style="flex: 2;">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="form-control search-input" placeholder="Search by shop name..." [(ngModel)]="searchQuery" (keyup.enter)="search()" style="border: none; background: transparent; width: 100%; outline: none;" />
              </div>
              <div class="search-divider"></div>
              <div class="search-input-group" style="flex: 1;">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <select class="form-control search-select" [(ngModel)]="selectedCity" (ngModelChange)="search()">
                  <option value="">All Cities</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                </select>
              </div>
              <button class="btn btn-primary btn-search" (click)="search()">Search</button>
            </div>
          </div>
        </div>
      </div>

      <div class="container section-content-wrapper">
        @if (isLoading()) {
          <div class="loader">Loading shops...</div>
        } @else if (shops().length === 0) {
          <div class="empty-state">No shops match your search.</div>
        } @else {
          <div class="grid animate-fade-in">
            @for (s of shops(); track s.id) {
              <div class="card shop-card">
                <div class="shop-card-body">
                  <div class="shop-header">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.8" style="margin-bottom: 12px; color: var(--primary)"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    <h3 class="shop-name">{{ s.shopName }}</h3>
                    <p class="shop-city">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {{ s.city }}
                    </p>
                  </div>
                  
                  <div class="shop-stats mt-3">
                    <p>{{ s.description || 'Welcome to ' + s.shopName + '.' }}</p>
                  </div>
                </div>
                
                <div class="shop-card-footer">
                  <a [routerLink]="['/shops', s.id]" class="btn btn-outline" style="width: 100%">Visit Shop</a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./shops-list.component.scss'] // Assuming we can use similar base styles
})
export class ShopsListComponent implements OnInit {
  private api = inject(ApiService);

  shops = signal<any[]>([]);
  isLoading = signal(true);

  searchQuery = '';
  selectedCity = '';

  ngOnInit() {
    this.search();
  }

  search() {
    this.isLoading.set(true);
    let params: any = {};
    if (this.searchQuery) params.q = this.searchQuery;
    if (this.selectedCity && this.selectedCity !== '') params.city = this.selectedCity;

    this.api.getAllShopsPublic(this.searchQuery, this.selectedCity).subscribe({
      next: (data) => {
        this.shops.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}
