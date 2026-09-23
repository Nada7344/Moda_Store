import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { IReview, IReviewProduct } from '../../core/models/review.model';
import { Rating } from '../../shared/rating/rating';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink, Rating],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {

  @Input({ required: true })
  review!: IReview;

  get product(): IReviewProduct | null {

    return typeof this.review.productId === 'string'
      ? null
      : this.review.productId;

  }

  get productImage(): string | null {

    const images = this.product?.images;

    return images?.length ? images[0].secure_url : null;

  }

  get customerName(): string {

    return this.review.userId?.name || 'Customer';

  }

  get customerInitial(): string {

    return this.customerName.charAt(0).toUpperCase();

  }

}
