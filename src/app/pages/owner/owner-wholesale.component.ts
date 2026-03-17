import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-owner-wholesale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="owner-products animate-fade-in">
      <div class="header-action">
        <h1 class="title-glow">My Wholesale Listings</h1>
        <button class="btn btn-primary" (click)="toggleForm()">
          {{ showForm() ? 'Cancel' : '+ Add Wholesale Listing' }}
        </button>
      </div>

      <!-- ADD / EDIT WHOLESALE FORM -->
      @if (showForm()) {
        <div class="card add-form animate-fade-in">
          <h2>{{ currentListingId() ? 'Edit Listing' : 'Add Wholesale Listing' }}</h2>
          
          @if (errorMsg()) { <div class="alert alert-danger">{{ errorMsg() }}</div> }

          <form (ngSubmit)="saveListing()" class="grid">
            <div class="form-group col-span-full">
              <label>Wholesale Item Title</label>
              <input type="text" class="form-control" [(ngModel)]="listing.title" name="title" required placeholder="e.g. Bulk iPhone Screens">
            </div>
            
            <div class="form-group">
              <label>Item Type</label>
              <select class="form-control" [(ngModel)]="listing.itemType" name="itemType" required>
                <option [value]="1">Phones</option>
                <option [value]="2">Accessories</option>
                <option [value]="3">Spare Parts</option>
                <option [value]="4">Repair Items</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Unit Price (LKR)</label>
              <input type="number" class="form-control" [(ngModel)]="listing.unitPrice" name="unitPrice" required>
            </div>
            
            <div class="form-group">
              <label>Minimum Order Quantity</label>
              <input type="number" class="form-control" [(ngModel)]="listing.minOrderQty" name="minOrderQty" required>
            </div>

            <div class="form-group">
              <label>Available Quantity</label>
              <input type="number" class="form-control" [(ngModel)]="listing.availableQty" name="availableQty" required>
            </div>

            <div class="form-group col-span-full">
              <label>Description</label>
              <textarea class="form-control" [(ngModel)]="listing.description" name="description" rows="3" required></textarea>
            </div>

            <div class="form-group col-span-full">
              <label>Wholesale Photo</label>
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; display: block;">Upload File</span>
                  <input type="file" class="form-control" accept="image/*" (change)="onFileSelected($event)">
                </div>
                <span style="color: #64748b; font-weight: 600; font-size: 0.85rem;">OR</span>
                <div style="flex: 1; min-width: 200px;">
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; display: block;">Paste Image URL</span>
                  <input type="text" class="form-control" [(ngModel)]="listing.imageUrl" name="imageUrl" placeholder="https://example.com/bulk.jpg">
                </div>
              </div>
              @if (isUploading()) {
                <span style="color: #3b82f6; font-size: 0.85rem; margin-top: 0.25rem; display: block;">Uploading image...</span>
              }
              @if (listing.imageUrl) {
                <div style="margin-top: 0.5rem;">
                  <img [src]="listing.imageUrl" alt="Preview" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                </div>
              }
            </div>
            
            <!-- Edit Mode: Status selection -->
            @if (currentListingId()) {
              <div class="form-group col-span-full">
                <label>Status</label>
                <select class="form-control" [(ngModel)]="listing.status" name="status" required>
                  <option [value]="1">Active</option>
                  <option [value]="2">Sold</option>
                  <option [value]="3">Hidden</option>
                </select>
              </div>
            }

            <div class="btn-group col-span-full">
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
                {{ currentListingId() ? 'Update Listing' : 'Create Listing' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- WHOLESALE DATATABLE -->
      <div class="card mt-2">
        @if (isLoading()) {
          <div class="loader">Loading your wholesale listings...</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px;">Photo</th>
                <th>Title</th>
                <th>Type</th>
                <th>Unit Price</th>
                <th>Min Qty</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (l of myListings(); track l.id) {
                <tr>
                  <td>
                    @if (l.imageUrl) {
                      <img [src]="l.imageUrl" [alt]="l.title" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" (error)="onImageError($event)">
                    } @else {
                      <div style="width: 40px; height: 40px; border-radius: 6px; background-color: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                      </div>
                    }
                  </td>
                  <td><strong>{{ l.title }}</strong></td>
                  <td>{{ l.itemType }}</td>
                  <td>LKR {{ l.unitPrice | number:'1.2-2' }}</td>
                  <td>{{ l.minOrderQty }}</td>
                  <td>{{ l.availableQty }}</td>
                  <td>
                    <span class="badge" 
                          [class.badge-active]="l.status === 'Active'"
                          [class.badge-sold]="l.status !== 'Active'">
                      {{ l.status }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm action-btn" (click)="editListing(l)">Edit</button>
                    <button class="btn btn-danger btn-sm action-btn" (click)="deleteListing(l.id)">Delete</button>
                  </td>
                </tr>
              }
              @if (myListings().length === 0) {
                <tr>
                  <td colspan="8" class="text-center">You haven't added any wholesale listings yet.</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styleUrls: ['./owner-products.component.scss'] // Reusing the same nice styles
})
export class OwnerWholesaleComponent implements OnInit {
  private api = inject(ApiService);

  myListings = signal<any[]>([]);
  isLoading = signal(true);

  showForm = signal(false);
  isSubmitting = signal(false);
  errorMsg = signal('');
  isUploading = signal(false);

  currentListingId = signal<string | null>(null);

  listing: any = this.getEmptyListing();

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.isLoading.set(true);
    this.api.getMyWholesaleListings().subscribe({
      next: (data) => {
        this.myListings.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // Maps backend string enum back to integer for the form
  private itemTypeToInt(type: string): number {
    const map: Record<string, number> = { 'Phone': 1, 'Accessory': 2, 'SparePart': 3, 'RepairItem': 4 };
    return map[type] || 1;
  }

  getEmptyListing() {
    return {
      title: '', description: '', itemType: 1,
      unitPrice: 0, minOrderQty: 10, availableQty: 100, status: 1, imageUrl: ''
    };
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm() {
    this.listing = this.getEmptyListing();
    this.currentListingId.set(null);
    this.errorMsg.set('');
    this.isUploading.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading.set(true);
    this.api.uploadImage(file, 'wholesale').subscribe({
      next: (res) => {
        this.listing.imageUrl = res.imageUrl;
        this.isUploading.set(false);
      },
      error: (err: any) => {
        this.isUploading.set(false);
        this.errorMsg.set(err.error?.message || 'Image upload failed');
      }
    });
  }

  editListing(l: any) {
    this.showForm.set(true);
    this.currentListingId.set(l.id);
    this.errorMsg.set('');

    let mappedStatus = 1;
    if (l.status === 'Sold') mappedStatus = 2;
    if (l.status === 'Hidden') mappedStatus = 3;

    this.listing = {
      listingId: l.id,
      title: l.title,
      description: l.description,
      itemType: this.itemTypeToInt(l.itemType),
      unitPrice: l.unitPrice,
      minOrderQty: l.minOrderQty,
      availableQty: l.availableQty,
      imageUrl: l.imageUrl || '',
      status: mappedStatus
    };
  }

  saveListing() {
    this.isSubmitting.set(true);
    this.errorMsg.set('');

    this.listing.itemType = Number(this.listing.itemType);
    this.listing.status = Number(this.listing.status);

    if (this.currentListingId()) {
      this.api.updateWholesaleListing(this.listing).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toggleForm();
          this.loadListings();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.errorMsg.set(err.error?.message || 'Update failed');
        }
      });
    } else {
      this.api.createWholesaleListing(this.listing).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toggleForm();
          this.loadListings();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.errorMsg.set(err.error?.message || 'Create failed');
        }
      });
    }
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  deleteListing(id: string) {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.api.deleteWholesaleListing(id).subscribe(() => this.loadListings());
    }
  }
}
