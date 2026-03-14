import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-star-rating',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="star-rating" [class.readonly]="readonly">
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <span 
          class="star" 
          [class.filled]="star <= (hoveredRating || rating)"
          (mouseenter)="onHover(star)"
          (mouseleave)="onLeave()"
          (click)="onClick(star)">
          ★
        </span>
      }
    </div>
  `,
    styles: [`
    .star-rating {
      display: inline-flex;
      font-size: 1.5rem;
      color: #333; /* empty gray star color */
      
      .star {
        cursor: pointer;
        transition: color 0.2s;
        
        &.filled {
          color: var(--gold);
        }
      }
      
      &.readonly .star {
        cursor: default;
      }
    }
  `]
})
export class StarRatingComponent {
    @Input() rating: number = 0;
    @Input() readonly: boolean = true;
    @Output() ratingChange = new EventEmitter<number>();

    hoveredRating: number = 0;

    onHover(star: number) {
        if (!this.readonly) this.hoveredRating = star;
    }

    onLeave() {
        if (!this.readonly) this.hoveredRating = 0;
    }

    onClick(star: number) {
        if (!this.readonly) {
            this.rating = star;
            this.ratingChange.emit(this.rating);
        }
    }
}
