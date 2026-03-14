import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  template: `
    <div class="shop-page animate-fade-in">
      @if (isLoadingShop()) {
        <div class="skeleton" style="padding: 4rem 2rem; border-radius: 24px; margin-bottom: 3rem; background: #fff; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center;">
          <div class="skeleton" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 1.5rem; background: #cbd5e1;"></div>
          <div class="skeleton" style="height: 36px; width: 40%; margin-bottom: 1rem; background: #cbd5e1;"></div>
          <div class="skeleton" style="height: 20px; width: 30%; margin-bottom: 2.5rem; background: #cbd5e1;"></div>
          <div class="skeleton" style="height: 45px; width: 200px; border-radius: 50px; background: #cbd5e1;"></div>
        </div>
      } @else if (!shop()) {
        <div class="empty-state">Shop not found.</div>
      } @else {
        <!-- SHOP HEADER -->
        <div class="shop-hero card">
          <div class="hero-content">
            @if (shop().imageUrl) {
              <img [src]="shop().imageUrl" alt="Shop Image" class="shop-logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">
            }
            <h1 class="title-glow">{{ shop().shopName }}</h1>
            <p class="location">📍 {{ shop().address }}, {{ shop().city }}</p>
            
            <div class="rating-summary">
              <app-star-rating [rating]="Math.round(shop().averageStars)" [readonly]="true"></app-star-rating>
              <span class="rating-text">{{ shop().averageStars | number:'1.1-1' }} ({{ shop().totalRatings }} reviews)</span>
            </div>
            
            <div class="contact-links">
              <a [href]="'https://wa.me/' + shop().whatsAppNumber" target="_blank" class="btn btn-outline wa">
                💬 WhatsApp ({{ shop().whatsAppNumber }})
              </a>
              <a [href]="'tel:' + shop().callNumber" class="btn btn-outline call">
                📞 Call ({{ shop().callNumber }})
              </a>
            </div>
          </div>
        </div>

        <!-- PRODUCTS GRID -->
        <div class="products-section mt-4">
          <h2 class="section-title">Products ({{ shop().productCount }})</h2>
          
          @if (isLoadingProducts()) {
            <div class="skeleton-grid mt-4">
              @for (sk of [1,2,3,4,5,6]; track sk) {
                <div class="skeleton-card">
                  <div class="skeleton sk-img"></div>
                  <div class="sk-body">
                    <div class="skeleton sk-title"></div>
                    <div class="skeleton sk-price"></div>
                    <div class="skeleton sk-text"></div>
                    <div class="skeleton sk-text-short"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state">This shop hasn't listed any items yet.</div>
          } @else {
            <div class="grid">
              @for (p of products(); track p.id) {
                <div class="product-card animate-fade-in">
                  <div class="product-img-wrapper">
                    <span class="badge" [class.badge-new]="p.condition === 'Brand New'" [class.badge-active]="p.condition !== 'Brand New'">
                      {{ p.condition }}
                    </span>
                    @if (p.imageUrl && !p.imageBroken) {
                      <img [src]="p.imageUrl" [alt]="p.title"
                           (error)="onImageError($event, p)">
                    } @else {
                      <div style="color: #93c5fd; background: #fff; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0, 80, 180, 0.06);">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                          <line x1="12" y1="18" x2="12.01" y2="18"></line>
                        </svg>
                      </div>
                    }
                  </div>
                  <div class="product-card-body">
                    <h3 class="product-title">{{ p.title }}</h3>
                    <div class="price">LKR {{ p.price | number:'1.2-2' }}</div>
                    <p class="desc">{{ p.description }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- REVIEWS SECTION -->
        <div class="reviews-section mt-4">
          <h2 class="section-title">Shop Reviews</h2>

          @if (isLoadingRatings()) {
            <div class="reviews-list">
              @for (sk of [1,2,3]; track sk) {
                <div class="skeleton-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                  <div class="skeleton" style="height: 20px; width: 40%;"></div>
                  <div class="skeleton" style="height: 15px; width: 100%;"></div>
                  <div class="skeleton" style="height: 15px; width: 100%;"></div>
                </div>
              }
            </div>
          } @else if (ratings().length === 0) {
            <div class="empty-state">No reviews yet for this shop.</div>
          } @else {
            <div class="reviews-list">
              @for (r of ratings(); track r.id) {
                <div class="review-card card animate-fade-in">
                  <div class="reviewer-info">
                    <strong>{{ r.raterShopName }}</strong>
                    <span class="text-muted">from {{ r.raterCity }}</span>
                    <span class="date">{{ r.createdAt | date:'MMM d, yyyy' }}</span>
                  </div>
                  <app-star-rating [rating]="r.stars" [readonly]="true"></app-star-rating>
                  @if (r.comment) {
                    <p class="review-comment">"{{ r.comment }}"</p>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  Math = Math; // Expose Math to template for rounding

  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  shopId: string | null = null;
  shop = signal<any>(null);
  products = signal<any[]>([]);
  ratings = signal<any[]>([]);

  isLoadingShop = signal(true);
  isLoadingProducts = signal(false);
  isLoadingRatings = signal(false);

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.loadShop(this.shopId);
      this.loadProducts(this.shopId);
      this.loadRatings(this.shopId);
    }
  }

  loadShop(id: string) {
    this.api.getShopPublic(id).subscribe({
      next: (data) => {
        this.shop.set(data);
        this.isLoadingShop.set(false);
      },
      error: () => this.isLoadingShop.set(false)
    });
  }

  loadProducts(id: string) {
    this.isLoadingProducts.set(true);
    this.api.getShopProductsPublic(id).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false)
    });
  }

  loadRatings(id: string) {
    this.isLoadingRatings.set(true);
    this.api.getShopRatingsPublic(id).subscribe({
      next: (data) => {
        this.ratings.set(data);
        this.isLoadingRatings.set(false);
      },
      error: () => this.isLoadingRatings.set(false)
    });
  }

  onImageError(event: any, item: any) {
    event.target.style.display = 'none';
    item.imageBroken = true;
    this.products.set([...this.products()]);
  }
}
