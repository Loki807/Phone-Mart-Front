import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-dashboard animate-fade-in">
      <div class="header-action">
        <h1 class="title-glow">Manage Shops</h1>
        <button class="btn btn-primary" (click)="toggleAddForm()">
          {{ showAddForm() ? 'Cancel' : '+ New Shop Owner' }}
        </button>
      </div>

      <!-- ADD NEW SHOP FORM -->
      @if (showAddForm()) {
        <div class="card add-form animate-fade-in">
          <h2>Register New Shop & Owner</h2>
          
          @if (errorMsg()) { <div class="alert alert-danger">{{ errorMsg() }}</div> }
          @if (successMsg()) { <div class="alert alert-success">{{ successMsg() }}</div> }

          <form (ngSubmit)="createShopOwner()" class="grid">
            <!-- Owner Info -->
            <div class="form-group">
              <label>Owner Full Name</label>
              <input type="text" class="form-control" [(ngModel)]="newShop.fullName" name="fullName" required>
            </div>
            <div class="form-group">
              <label>Owner Email (Login)</label>
              <input type="email" class="form-control" [(ngModel)]="newShop.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Owner Password</label>
              <input type="password" class="form-control" [(ngModel)]="newShop.password" name="password" required>
            </div>

            <!-- Shop Info -->
            <div class="form-group">
              <label>Shop Name</label>
              <input type="text" class="form-control" [(ngModel)]="newShop.shopName" name="shopName" required>
            </div>
            <div class="form-group">
              <label>Phone Number (Call)</label>
              <input type="text" class="form-control" [(ngModel)]="newShop.phoneNumber" name="phoneNumber" required>
            </div>
            <div class="form-group">
              <label>WhatsApp Number</label>
              <input type="text" class="form-control" [(ngModel)]="newShop.whatsAppNumber" name="whatsAppNumber" required>
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" class="form-control" [(ngModel)]="newShop.address" name="address" required>
            </div>
            <div class="form-group">
              <label>City</label>
              <input type="text" class="form-control" [(ngModel)]="newShop.city" name="city" required>
            </div>
            <div class="form-group col-span-full">
              <label>Shop Photo / Logo</label>
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; display: block;">Upload File</span>
                  <input type="file" class="form-control" accept="image/*" (change)="onShopFileSelected($event)">
                </div>
                <span style="color: #64748b; font-weight: 600; font-size: 0.85rem;">OR</span>
                <div style="flex: 1; min-width: 200px;">
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; display: block;">Paste Image URL</span>
                  <input type="text" class="form-control" [(ngModel)]="newShop.imageUrl" name="imageUrl" placeholder="https://example.com/logo.jpg">
                </div>
              </div>
              @if (isUploadingShopImage()) {
                <span style="color: #3b82f6; font-size: 0.85rem; margin-top: 0.25rem; display: block;">Uploading image...</span>
              }
              @if (newShop.imageUrl) {
                <div style="margin-top: 0.5rem;">
                  <img [src]="newShop.imageUrl" alt="Preview" style="max-width: 80px; max-height: 80px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);">
                </div>
              }
            </div>

            <div class="btn-group col-span-full">
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">Create Shop & Owner</button>
            </div>
          </form>
        </div>
      }

      <!-- SHOPS DATATABLE -->
      <div class="card mt-2">
        @if (isLoading()) {
          <div class="loader">Loading shops...</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Owner Email</th>
                <th>City</th>
                <th>WhatsApp</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              @for (shop of shops(); track shop.id) {
                <tr>
                  <td><strong>{{ shop.shopName }}</strong></td>
                  <td>{{ shop.ownerEmail }}</td>
                  <td>{{ shop.city }}</td>
                  <td>{{ shop.whatsAppNumber }}</td>
                  <td>{{ shop.createdAt | date }}</td>
                </tr>
              }
              @if (shops().length === 0) {
                <tr>
                  <td colspan="5" class="text-center">No shops registered yet.</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);

  shops = signal<any[]>([]);
  isLoading = signal(true);

  showAddForm = signal(false);
  isSubmitting = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  isUploadingShopImage = signal(false);

  newShop = {
    fullName: '', email: '', password: '',
    shopName: '', phoneNumber: '', whatsAppNumber: '', address: '', city: '', imageUrl: ''
  };

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.isLoading.set(true);
    this.api.getShops().subscribe({
      next: (data) => {
        this.shops.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("Error loading shops", err);
        this.isLoading.set(false);
      }
    });
  }

  toggleAddForm() {
    this.showAddForm.set(!this.showAddForm());
    this.errorMsg.set('');
    this.successMsg.set('');
    this.isUploadingShopImage.set(false);
  }

  onShopFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploadingShopImage.set(true);
    this.api.uploadImage(file, 'shops').subscribe({
      next: (res) => {
        this.newShop.imageUrl = res.imageUrl;
        this.isUploadingShopImage.set(false);
      },
      error: (err: any) => {
        this.isUploadingShopImage.set(false);
        this.errorMsg.set(err.error?.message || 'Image upload failed');
      }
    });
  }

  createShopOwner() {
    this.isSubmitting.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.api.createShopOwner(this.newShop).subscribe({
      next: () => {
        this.successMsg.set('Shop owner successfully created!');
        this.newShop = {
          fullName: '', email: '', password: '',
          shopName: '', phoneNumber: '', whatsAppNumber: '', address: '', city: '', imageUrl: ''
        };
        this.isSubmitting.set(false);
        this.loadShops(); // Refresh list
        setTimeout(() => {
          this.toggleAddForm();
        }, 2000);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to create shop owner.');
      }
    });
  }
}
