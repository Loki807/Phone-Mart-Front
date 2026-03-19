import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-owner-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="owner-products animate-fade-in">
      <div class="header-action">
        <h1 class="title-glow">My Products</h1>
        <button class="btn btn-primary" (click)="toggleForm()">
          {{ showForm() ? 'Cancel' : '+ Add Product' }}
        </button>
      </div>

      <!-- ADD / EDIT PRODUCT FORM -->
      @if (showForm()) {
        <div class="card add-form animate-fade-in">
          <h2>{{ currentProductId() ? 'Edit Product' : 'Add New Product' }}</h2>
          
          @if (errorMsg()) { <div class="alert alert-danger">{{ errorMsg() }}</div> }

          <form (ngSubmit)="saveProduct()" class="grid">
            <div class="form-group col-span-full">
              <label>Product Title</label>
              <input type="text" class="form-control" [(ngModel)]="product.title" name="title" required placeholder="e.g. iPhone 13 Pro Max 256GB">
            </div>
            
            <div class="form-group">
              <label>Price (LKR)</label>
              <input type="number" class="form-control" [(ngModel)]="product.price" name="price" required>
            </div>
            
            <div class="form-group">
              <label>Category</label>
              <select class="form-control" [(ngModel)]="product.categoryId" name="categoryId" required>
                @for (c of categories(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Brand</label>
              <select class="form-control" [(ngModel)]="product.brandId" name="brandId">
                <option [ngValue]="null">No Brand / Other</option>
                @for (b of brands(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            
            <div class="form-group">
              <label>Condition</label>
              <select class="form-control" [(ngModel)]="product.condition" name="condition" required>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <div class="form-group col-span-full">
              <label>Description</label>
              <textarea class="form-control" [(ngModel)]="product.description" name="description" rows="3" required></textarea>
            </div>

            <div class="form-group">
              <label>Stock Quantity</label>
              <input type="number" class="form-control" [(ngModel)]="product.stockQuantity" name="stockQuantity" required min="0" placeholder="e.g. 5">
            </div>

            <div class="form-group col-span-full">
              <label>Product Photo</label>
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; display: block;">Upload File</span>
                  <input type="file" class="form-control" accept="image/*" (change)="onFileSelected($event)">
                </div>
                <span style="color: #64748b; font-weight: 600; font-size: 0.85rem;">OR</span>
                <div style="flex: 1; min-width: 200px;">
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; display: block;">Paste Image URL</span>
                  <input type="text" class="form-control" [(ngModel)]="product.imageUrl" name="imageUrl" placeholder="https://example.com/phone.jpg">
                </div>
              </div>
              @if (isUploading()) {
                <span style="color: #3b82f6; font-size: 0.85rem; margin-top: 0.25rem; display: block;">Uploading image...</span>
              }
              @if (product.imageUrl) {
                <div style="margin-top: 0.5rem;">
                  <img [src]="product.imageUrl" alt="Preview" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                </div>
              }
            </div>
            
            <!-- Edit Mode: Status selection -->
            @if (currentProductId()) {
              <div class="form-group col-span-full">
                <label>Status</label>
                <select class="form-control" [(ngModel)]="product.status" name="status" required>
                  <option [value]="1">Active</option>
                  <option [value]="2">Sold</option>
                  <option [value]="3">Hidden</option>
                </select>
              </div>
            }

            <div class="btn-group col-span-full">
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
                {{ currentProductId() ? 'Update Product' : 'Create Product' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- PRODUCTS DATATABLE -->
      <div class="card mt-2">
        <div class="filters" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <input type="text" class="form-control" style="flex: 1;" placeholder="Search products by title..." [(ngModel)]="searchTerm">
          <select class="form-control" style="width: auto;" [(ngModel)]="filterStatus">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Sold">Sold</option>
            <option value="Hidden">Hidden</option>
          </select>
        </div>

        @if (isLoading()) {
          <div class="loader">Loading your products...</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredProducts; track p.id) {
                <tr>
                  <td><strong>{{ p.title }}</strong></td>
                  <td>LKR {{ p.price | number:'1.2-2' }}</td>
                  <td>
                    <span [style.color]="p.stockQuantity < 3 ? '#ef4444' : '#22c55e'" style="font-weight: 600;">{{ p.stockQuantity }}</span>
                  </td>
                  <td>{{ p.condition }}</td>
                  <td>
                    <span class="badge" 
                          [class.badge-active]="p.status === 'Active'"
                          [class.badge-sold]="p.status !== 'Active'">
                      {{ p.status }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm action-btn" (click)="editProduct(p)">Edit</button>
                    <button class="btn btn-danger btn-sm action-btn" (click)="deleteProduct(p.id)">Delete</button>
                  </td>
                </tr>
              }
              @if (filteredProducts.length === 0) {
                <tr>
                  <td colspan="6" class="text-center">No products found.</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styleUrls: ['./owner-products.component.scss']
})
export class OwnerProductsComponent implements OnInit {
  private api = inject(ApiService);

  myProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  brands = signal<any[]>([]);
  
  isLoading = signal(true);

  showForm = signal(false);
  isSubmitting = signal(false);
  errorMsg = signal('');
  isUploading = signal(false);

  searchTerm = '';
  filterStatus = 'All';

  // Track if we are editing
  currentProductId = signal<string | null>(null);

  product: any = this.getEmptyProduct();

  ngOnInit() {
    this.loadProducts();
    this.loadLookups();
  }

  loadLookups() {
    this.api.getCategories().subscribe(res => this.categories.set(res));
    this.api.getBrands().subscribe(res => this.brands.set(res));
  }

  get filteredProducts() {
    return this.myProducts().filter(p => {
      const matchSearch = p.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = this.filterStatus === 'All' || p.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.api.getMyProducts().subscribe({
      next: (data) => {
        this.myProducts.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  getEmptyProduct() {
    return {
      categoryId: 1, brandId: null, title: '', description: '',
      price: 0, condition: 'Good', stockQuantity: 1, status: 1, imageUrl: '' // Default to Active (1)
    };
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm() {
    this.product = this.getEmptyProduct();
    this.currentProductId.set(null);
    this.errorMsg.set('');
    this.isUploading.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading.set(true);
    this.api.uploadImage(file, 'products').subscribe({
      next: (res) => {
        this.product.imageUrl = res.imageUrl;
        this.isUploading.set(false);
      },
      error: (err: any) => {
        this.isUploading.set(false);
        this.errorMsg.set(err.error?.message || 'Image upload failed');
      }
    });
  }

  editProduct(p: any) {
    this.showForm.set(true);
    this.currentProductId.set(p.id);
    this.errorMsg.set('');

    // Map string status back to enum int for the form
    let mappedStatus = 1;
    if (p.status === 'Sold') mappedStatus = 2;
    if (p.status === 'Hidden') mappedStatus = 3;

    this.product = {
      productId: p.id,
      categoryId: p.categoryId || 1, 
      brandId: p.brandId || null, 
      title: p.title,
      description: p.description,
      price: p.price,
      condition: p.condition,
      stockQuantity: p.stockQuantity ?? 1,
      imageUrl: p.imageUrl || '',
      status: mappedStatus
    };
  }

  saveProduct() {
    this.isSubmitting.set(true);
    this.errorMsg.set('');

    // Since we are taking numeric values from form select, ensure they are numbers
    this.product.categoryId = Number(this.product.categoryId);
    this.product.brandId = this.product.brandId ? Number(this.product.brandId) : null;
    this.product.status = Number(this.product.status);

    if (this.currentProductId()) {
      // UPDATE
      this.api.updateProduct(this.product).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toggleForm();
          this.loadProducts();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.errorMsg.set(err.error?.message || 'Update failed');
        }
      });
    } else {
      // CREATE
      this.api.createProduct(this.product).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toggleForm();
          this.loadProducts();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.errorMsg.set(err.error?.message || 'Create failed');
        }
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }
}
