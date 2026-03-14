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
                <option value="Phones">Phones</option>
                <option value="Parts">Parts</option>
                <option value="Accessories">Accessories</option>
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
            
            <!-- Edit Mode: Status selection -->
            @if (currentListingId()) {
              <div class="form-group col-span-full">
                <label>Status</label>
                <select class="form-control" [(ngModel)]="listing.status" name="status" required>
                  <option [value]="0">Active</option>
                  <option [value]="1">Sold</option>
                  <option [value]="2">Hidden</option>
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
                  <td colspan="7" class="text-center">You haven't added any wholesale listings yet.</td>
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

  getEmptyListing() {
    return {
      title: '', description: '', itemType: 'Parts',
      unitPrice: 0, minOrderQty: 10, availableQty: 100, status: 0
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
  }

  editListing(l: any) {
    this.showForm.set(true);
    this.currentListingId.set(l.id);
    this.errorMsg.set('');

    let mappedStatus = 0;
    if (l.status === 'Sold') mappedStatus = 1;
    if (l.status === 'Hidden') mappedStatus = 2;

    this.listing = {
      listingId: l.id,
      title: l.title,
      description: l.description,
      itemType: l.itemType,
      unitPrice: l.unitPrice,
      minOrderQty: l.minOrderQty,
      availableQty: l.availableQty,
      status: mappedStatus
    };
  }

  saveListing() {
    this.isSubmitting.set(true);
    this.errorMsg.set('');

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

  deleteListing(id: string) {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.api.deleteWholesaleListing(id).subscribe(() => this.loadListings());
    }
  }
}
