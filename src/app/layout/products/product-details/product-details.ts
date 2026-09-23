import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  IProduct
} from '../../../core/models/product.model';

import {
  IReview
} from '../../../core/models/review.model';

import {
  ProductService
} from '../../../core/services/product.service';

import {
  ReviewService
} from '../../../core/services/review.service';

import {
  CartService
} from '../../../core/services/cart.service';

import {
  AuthService
} from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive/scroll-reveal.directive';

@Component({
  selector: 'app-product-details',

  imports: [FormsModule , DatePipe , DecimalPipe, RouterLink, ScrollRevealDirective],

  templateUrl: './product-details.html',

  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {

  product: IProduct | null = null;

  reviews: IReview[] = [];

  reviewsTotal = 0;

  reviewsPage = 1;

  reviewsSize = 10;

  reviewsTotalPages = 0;

  selectedImage = 0;

  quantity = 1;

  isLoading = false;

  isReviewsLoading = false;

  isAddingToCart = false;

  reviewRate = 0;

  reviewMessage = '';

  reviewMinLength = 10;

  reviewAttempted = false;

  reviewRateTouched = false;

  reviewMessageTouched = false;

  isSubmittingReview = false;

  isLoggedIn = false;

  errorMessage = '';
  reviewFeedbackMessage = '';

  reviewFeedbackType: 'success' | 'error' | '' = '';

  constructor(
    private _route: ActivatedRoute,

    private _productService: ProductService,

    private _reviewService: ReviewService,

    private _cartService: CartService,

    private _authService: AuthService,

    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.checkLogin();

    this.getProduct();

  }

  checkLogin(): void {

    this._authService.checkIfLogin();

    this._authService
      .returnUserData()
      .subscribe(user => {

        this.isLoggedIn = !!user;

        this._cdr.detectChanges();

      });

  }

  getProduct(): void {

    const slug =
      this._route.snapshot.paramMap.get('slug');

    if (!slug) {

      this.errorMessage =
        'Product not found';

      return;

    }

    this.isLoading = true;

    this._productService
      .getProductBySlug(slug)

      .pipe(

        finalize(() => {

          this.isLoading = false;

          this._cdr.detectChanges();

        })

      )

      .subscribe({

        next: response => {

          this.product =
            response.data.product;

          this.selectedImage = 0;

          this.quantity = 1;

          this.getReviews();

        },

        error: error => {

          console.error(
            'Product Details Error:',
            error
          );

          this.product = null;

          this.errorMessage =
            'Unable to load this product';

        }

      });

  }

  getReviews(): void {

    if (!this.product) {

      return;

    }

    this.isReviewsLoading = true;

    this._reviewService

      .getProductReviews(
        this.product._id,
        this.reviewsPage,
        this.reviewsSize
      )

      .pipe(

        finalize(() => {

          this.isReviewsLoading = false;

          this._cdr.detectChanges();

        })

      )

      .subscribe({

        next: response => {

          this.reviews =
            response.data.result;

          this.reviewsTotal =
            response.data.docsCount;

          this.reviewsTotalPages =
            response.data.pages;

          this.reviewsPage =
            response.data.currentPage;

        },

        error: error => {

          console.error(
            'Reviews Error:',
            error
          );

          this.reviews = [];

        }

      });

  }

  selectImage(index: number): void {

    this.selectedImage = index;

  }

  decreaseQuantity(): void {

    if (this.quantity > 1) {

      this.quantity--;

    }

  }

  increaseQuantity(): void {

    if (!this.product) {

      return;

    }

    if (
      this.quantity < this.product.stock
    ) {

      this.quantity++;

    }

  }

addToCart(): void {

  if (!this.product) {
    return;
  }

  if (this.product.isOutOfStock) {
    return;
  }

  this.isAddingToCart = true;

  this.errorMessage = '';

  this._cartService.addToCart(
    this.product,
    this.quantity,
    this.isLoggedIn
  )
    .pipe(

      finalize(() => {

        this.isAddingToCart = false;

        this._cdr.detectChanges();

      })

    )
    .subscribe({

      next: response => {

        console.log(
          'Added to cart:',
          response
        );

      },

      error: error => {

        console.error(
          'Add To Cart Error:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to add product to cart';

      }

    });

}

  setReviewRate(rate: number): void {

    this.reviewRate = rate;

    this.reviewRateTouched = true;

  }

  onReviewMessageBlur(): void {

    this.reviewMessageTouched = true;

  }

  submitReview(): void {

    if (!this.product) {

      return;

    }

    this.reviewAttempted = true;

    this.reviewFeedbackMessage = '';

    this.reviewFeedbackType = '';

    if (!this.isLoggedIn) {

      this.reviewFeedbackMessage =
        'Please login first';

      this.reviewFeedbackType = 'error';

      return;

    }

    const trimmedMessage =
      this.reviewMessage.trim();

    const isRatingValid =
      this.reviewRate >= 1;

    const isMessageValid =
      trimmedMessage.length >= this.reviewMinLength;

    if (!isRatingValid || !isMessageValid) {

     
      return;

    }

    this.isSubmittingReview = true;

    this._reviewService

      .createReview({

        productId: this.product._id,

        rate: this.reviewRate,

        message: trimmedMessage

      })

      .pipe(

        finalize(() => {

          this.isSubmittingReview = false;

          this._cdr.detectChanges();

        })

      )

      .subscribe({

        next: response => {

          console.log(
            'Review submitted:',
            response
          );

          this.reviewRate = 0;

          this.reviewMessage = '';

          this.reviewAttempted = false;

          this.reviewRateTouched = false;

          this.reviewMessageTouched = false;

          this.reviewFeedbackMessage =
            'Your review has been submitted.';

          this.reviewFeedbackType = 'success';

        },

        error: error => {

          console.error(
            'Submit Review Error:',
            error
          );

          this.reviewFeedbackMessage =
            error?.error?.message ||
            'Unable to submit review';

          this.reviewFeedbackType = 'error';

        }

      });

  }

  getStars(
    rating: number
  ): number[] {

    return Array.from(
      { length: 5 },
      (_, index) => index + 1
    );

  }

  isStarFilled(
    star: number,
    rating: number
  ): boolean {

    return star <= Math.round(rating);

  }

}
