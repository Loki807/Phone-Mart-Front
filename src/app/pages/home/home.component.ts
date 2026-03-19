import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- ═══ BRIGHT SKY BACKGROUND ═══ -->
    <div class="sky-wrapper">
      <div class="sun-glow"></div>

      <!-- ═══ HERO SECTION ═══ -->
      <section class="hero-section">
        <div class="hero-container">
          
          <!-- Left: Content -->
          <div class="hero-content animate-fade-up">
            <div class="hero-badge">🏆 Sri Lanka's #1 Phone Marketplace</div>
            <h1>
              Find Your Perfect<br/>
              <span class="title-highlight">Phone Deal</span>
            </h1>
            <p class="hero-subtitle">
              Buy and sell new or used mobile phones, accessories, and spare parts. Connect with verified shops nationwide with zero hassle.
            </p>
            
            <div class="hero-stats">
              <div class="stat"><span class="stat-num">500+</span> Verified Shops</div>
              <div class="stat-dot"></div>
              <div class="stat"><span class="stat-num">10k+</span> Products</div>
              <div class="stat-dot"></div>
              <div class="stat"><span class="stat-num">24/7</span> Support</div>
            </div>
          </div>

          <!-- Right: Image -->
          <div class="hero-image-wrapper animate-float">
            <div class="hero-glow"></div>
            <img src="hero-phone.png" alt="Premium Smartphone" class="hero-phone-img" />
          </div>
        </div>
        <div class="hero-wave">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C320,100 620,0 960,50 C1200,85 1380,20 1440,40 L1440,100 L0,100 Z" fill="#f0f6ff"/>
          </svg>
        </div>
      </section>

      <!-- ═══ PRODUCTS SECTION ═══ -->
      <section class="products-section">
      <div class="section-content-wrapper">
      <div class="section-header">
        <h2>Latest Listings</h2>
        <p class="section-subtitle">Fresh phones and accessories added by our top-rated shops</p>
      </div>

      <!-- ═══ SEARCH & FILTER BAR ═══ -->
      <div class="search-filter-wrapper" id="search-filter-wrapper">
        <div class="search-bar" (click)="openFilters()">
          <div class="search-bar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input type="text" 
                 placeholder="Search phones, parts, brands..." 
                 [(ngModel)]="searchQuery"
                 (focus)="openFilters()"
                 (keyup.enter)="search(true)"
                 class="search-bar-input"
                 id="search-input" />
          <div class="search-bar-filter-hint" [class.hidden]="filtersOpen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="11" y1="18" x2="13" y2="18"></line>
            </svg>
            Filters
          </div>
        </div>

        <!-- ═══ EXPANDABLE FILTER PANEL ═══ -->
        <div class="filter-panel" [class.open]="filtersOpen">
          <div class="filter-panel-inner">
            <div class="filter-group">
              <label class="filter-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
                Category
              </label>
              <select [(ngModel)]="selectedCategory" (ngModelChange)="search(true)" class="filter-select">
                <option [value]="null">All Categories</option>
                @for (c of categories(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                City
              </label>
              <select [(ngModel)]="selectedCity" (ngModelChange)="search(true)" class="filter-select">
                <option value="">All Cities</option>
                <option value="Colombo">Colombo</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                Brand
              </label>
              <select [(ngModel)]="selectedBrand" (ngModelChange)="search(true)" class="filter-select">
                <option [value]="null">All Brands</option>
                @for (b of brands(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>

            <div class="filter-actions">
              <button class="btn-filter-search" (click)="search(true)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                Search
              </button>
              <button class="btn-filter-clear" (click)="clearFilters()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Active filter tags -->
        @if (hasActiveFilters()) {
          <div class="active-filters">
            @if (selectedCategory) {
              <span class="filter-tag">
                {{ getCategoryName(selectedCategory) }}
                <button (click)="selectedCategory = null; search(true)">×</button>
              </span>
            }
            @if (selectedCity) {
              <span class="filter-tag">
                {{ selectedCity }}
                <button (click)="selectedCity = ''; search(true)">×</button>
              </span>
            }
            @if (selectedBrand) {
              <span class="filter-tag">
                {{ getBrandName(selectedBrand) }}
                <button (click)="selectedBrand = null; search(true)">×</button>
              </span>
            }
            @if (searchQuery) {
              <span class="filter-tag">
                "{{ searchQuery }}"
                <button (click)="searchQuery = ''; search(true)">×</button>
              </span>
            }
          </div>
        }
      </div>
      
      @if (isLoading()) {
        <div class="skeleton-grid">
          @for (sk of [1,2,3,4,5,6]; track sk) {
            <div class="skeleton-card">
              <div class="skeleton sk-img"></div>
              <div class="sk-body">
                <div class="skeleton sk-title"></div>
                <div class="skeleton sk-price"></div>
                <div class="skeleton sk-text"></div>
                <div class="skeleton sk-text-short"></div>
              </div>
              <div class="sk-footer">
                <div class="skeleton sk-btn"></div>
                <div class="skeleton sk-btn"></div>
              </div>
            </div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>No products found</h3>
          <p>Try a different search term or adjust your filters to find what you need.</p>
        </div>
      } @else {
        <div class="products-grid animate-fade-in">
          @for (p of products(); track p.id) {
            <div class="product-card">
              <div class="product-card-top">
                @if (p.imageUrl && !p.imageBroken) {
                  <img [src]="p.imageUrl" [alt]="p.title" class="product-image"
                       style="width: 100%; height: 200px; object-fit: cover; border-top-left-radius: 12px; border-top-right-radius: 12px;"
                       (error)="onImageError($event, p)">
                } @else {
                  <div class="product-image-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                  </div>
                }
                <span class="badge" 
                      [class.badge-new]="p.condition === 'Brand New'"
                      [class.badge-active]="p.condition !== 'Brand New'">
                  {{ p.condition }}
                </span>
              </div>
              
              <div class="product-card-body">
                <h3 class="product-title">{{ p.title }}</h3>
                <div class="product-price">LKR {{ p.price | number:'1.0-0' }}</div>
                
                <div class="product-specs">
                  @if (p.storage) {
                    <span class="spec-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                      {{ p.storage }}
                    </span>
                  }
                  @if (p.warranty) {
                    <span class="spec-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      {{ p.warranty }}
                    </span>
                  }
                </div>
              </div>

              <div class="product-card-footer">
                <div class="shop-info-row">
                  <div class="shop-details">
                    <a [routerLink]="['/shops', p.shopId]" class="shop-name">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      {{ p.shopName }}
                    </a>
                  </div>
                  @if (p.shopCity) {
                    <span class="shop-city">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {{ p.shopCity }}
                    </span>
                  }
                </div>
                <div class="contact-actions">
                  <a [href]="'https://wa.me/' + p.shopWhatsApp" target="_blank" class="contact-btn btn-wa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.218l-.257-.154-2.665.699.711-2.595-.17-.269A7.96 7.96 0 014 12a8 8 0 1116 0 8 8 0 01-8 8z"/></svg>
                    WhatsApp
                  </a>
                  <a [href]="'tel:' + p.shopCallNumber" class="contact-btn btn-call">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Call
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
        
        @if (products().length > 0 && hasMore) {
          <div class="load-more-container mt-4 text-center">
            <button class="btn btn-outline" style="min-width: 200px" (click)="loadMore()" [disabled]="isLoadingMore">
              {{ isLoadingMore ? 'Loading...' : 'Load More Products' }}
            </button>
          </div>
        }
      }
      </div>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);

  categories = signal<any[]>([]);
  brands = signal<any[]>([]);
  products = signal<any[]>([]);
  isLoading = signal(true);
  filtersOpen = false;

  currentPage = 1;
  hasMore = true;
  isLoadingMore = false;

  searchQuery = '';
  selectedCategory: number | null = null;
  selectedCity = '';
  selectedBrand: number | null = null;

  ngOnInit() {
    this.api.getCategories().subscribe(res => this.categories.set(res));
    this.api.getBrands().subscribe(res => this.brands.set(res));
    this.search(true); // initial load
  }

  openFilters() {
    this.filtersOpen = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const wrapper = document.getElementById('search-filter-wrapper');
    if (wrapper && !wrapper.contains(event.target as Node)) {
      this.filtersOpen = false;
    }
  }

  search(reset = true) {
    if (reset) {
      this.currentPage = 1;
      this.hasMore = true;
      this.isLoading.set(true);
    } else {
      this.isLoadingMore = true;
    }

    this.api.searchProducts(
      this.searchQuery, 
      this.selectedCategory || undefined, 
      this.selectedCity || undefined, 
      this.selectedBrand || undefined, 
      this.currentPage
    ).subscribe({
        next: (data) => {
          if (data.length < 20) {
            this.hasMore = false;
          }

          if (reset) {
            this.products.set(data);
            this.isLoading.set(false);
          } else {
            this.products.set([...this.products(), ...data]);
            this.isLoadingMore = false;
          }
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading.set(false);
          this.isLoadingMore = false;
        }
      });
  }

  loadMore() {
    if (this.hasMore && !this.isLoadingMore) {
      this.currentPage++;
      this.search(false);
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedCity = '';
    this.selectedBrand = null;
    this.search(true);
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory || this.selectedCity || this.selectedBrand);
  }

  getCategoryName(id: number): string {
    const cat = this.categories().find(c => c.id == id);
    return cat ? cat.name : '';
  }

  getBrandName(id: number): string {
    const brand = this.brands().find(b => b.id == id);
    return brand ? brand.name : '';
  }

  onImageError(event: any, product: any) {
    event.target.style.display = 'none';
    product.imageBroken = true;
    this.products.set([...this.products()]);
  }
}
