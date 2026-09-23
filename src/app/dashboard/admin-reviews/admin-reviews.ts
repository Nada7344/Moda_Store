import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReviewService } from '../../core/services/review.service';
import { IReview, IReviewProduct } from '../../core/models/review.model';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { Rating } from '../../shared/rating/rating';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    StatusBadge,
    Rating
  ],

  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css',
})
export class AdminReviews implements OnInit {

  constructor(
    private _reviewService: ReviewService,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) {}

  reviews: IReview[] = [];

  isLoading = true;
  errorMessage = '';

  readonly statuses = ['Pending', 'Approved', 'Declined'];

  statusFilter = '';

  searchTerm = '';

  page = 1;
  size = 10;
  pages = 1;
  docsCount = 0;

  reviewInFocus: IReview | null = null;

  busyReviewId: string | null = null;

  actionErrorMessage = '';

  ngOnInit(): void {

    const statusFromUrl = this._route.snapshot.queryParamMap.get('status');

    if (statusFromUrl && this.statuses.includes(statusFromUrl)) {

      this.statusFilter = statusFromUrl;

    }

    this.loadReviews();

  }

  loadReviews(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._reviewService
      .getReviewsAdmin({
        page: this.page,
        size: this.size,
        status: this.statusFilter || undefined,
      })
      .subscribe({

        next: response => {

          this.reviews = response.data.result || [];
          this.pages = response.data.pages || 1;
          this.docsCount = response.data.docsCount || 0;
          this.page = response.data.currentPage || this.page;

          this.isLoading = false;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error('ADMIN REVIEWS — LOAD ERROR:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load reviews right now.';

          this.isLoading = false;

          this._cdr.detectChanges();

        }

      });

  }

  onStatusFilterChange(value: string): void {

    this.statusFilter = value;
    this.page = 1;

    this.loadReviews();

  }

  get visibleReviews(): IReview[] {

    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {

      return this.reviews;

    }

    return this.reviews.filter(review => {

      const product = this.productName(review).toLowerCase();
      const customer = this.customerName(review).toLowerCase();
      const message = (review.message || '').toLowerCase();

      return (
        product.includes(term) ||
        customer.includes(term) ||
        message.includes(term)
      );

    });

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.pages || page === this.page) {

      return;

    }

    this.page = page;

    this.loadReviews();

  }

  get pageNumbers(): number[] {

    return Array.from({ length: this.pages }, (_, index) => index + 1);

  }

  get rangeStart(): number {

    return this.docsCount === 0 ? 0 : (this.page - 1) * this.size + 1;

  }

  get rangeEnd(): number {

    return Math.min(this.page * this.size, this.docsCount);

  }

  openReview(review: IReview): void {

    this.actionErrorMessage = '';
    this.reviewInFocus = review;

  }

  closeReview(): void {

    this.reviewInFocus = null;

  }

  approveReview(review: IReview): void {

    this.setReviewStatus(review, 'Approved');

  }

  declineReview(review: IReview): void {

    this.setReviewStatus(review, 'Declined');

  }

  private setReviewStatus(review: IReview, status: 'Approved' | 'Declined'): void {

    this.actionErrorMessage = '';
    this.busyReviewId = review._id;

    this._reviewService
      .updateReviewStatusAdmin(review._id, status)
      .subscribe({

        next: response => {

          const updated = response.data.review;

          const index = this.reviews.findIndex(item => item._id === updated._id);

          if (index !== -1) {

            this.reviews[index] = updated;

          }

          if (this.reviewInFocus?._id === updated._id) {

            this.reviewInFocus = updated;

          }

          this.busyReviewId = null;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error('ADMIN REVIEWS — STATUS UPDATE ERROR:', error);

          this.actionErrorMessage =
            error?.error?.message ||
            'Unable to update this review right now.';

          this.busyReviewId = null;

          this._cdr.detectChanges();

        }

      });

  }

  isPending(review: IReview): boolean {

    return review.status === 'Pending' || review.status === 'Unread';

  }

  customerName(review: IReview): string {

    return review.userId?.name || 'Customer';

  }

  customerEmail(review: IReview): string {

    return review.userId?.email || '';

  }

  private productOf(review: IReview): IReviewProduct | null {

    return typeof review.productId === 'string' ? null : review.productId;

  }

  productName(review: IReview): string {

    return this.productOf(review)?.name || 'Deleted product';

  }

  productImage(review: IReview): string | null {

    const images = this.productOf(review)?.images;

    return images?.length ? images[0].secure_url : null;

  }

}
