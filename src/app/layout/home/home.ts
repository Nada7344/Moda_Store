import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductCard } from '../../shared/product-card/product-card';
import { Review } from '../review/review';
import { IProduct } from '../../core/models/product.model';
import { ICategory } from '../../core/models/category.model';
import { IReview } from '../../core/models/review.model';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ReviewService } from '../../core/services/review.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, Review],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {

  constructor(private _productService: ProductService,
    private _categoryService: CategoryService,
    private _reviewService: ReviewService,
    private _cdr: ChangeDetectorRef) {}

  products: IProduct[] = [];
  topSales: IProduct[] = [];
  categories: ICategory[] = [];
  featuredReviews: IReview[] = [];
  private subscriptions: Subscription = new Subscription();

  @ViewChild('reviewsTrack')
  reviewsTrack?: ElementRef<HTMLDivElement>;

  readonly reviewsPerView = 3;

  canScrollReviewsPrev = false;
  canScrollReviewsNext = true;

  ngOnInit(): void {
    this.getNewArrivals();
    this.getTopSales();
    this.getCategories();
    this.getFeaturedReviews();
  }

  private getNewArrivals(): void {
    const sub = this._productService.getNewArrivals().subscribe({
      next: (res) => {
        this.products = res.data.result;
         this._cdr.detectChanges();
      },
      error: (err) => { console.log(err); }
    });
    this.subscriptions.add(sub);
  }

  private getTopSales(): void {
    const sub = this._productService.getTopSales().subscribe({
      next: (res) => {
        this.topSales = res.data.result;
         this._cdr.detectChanges();
      },
      error: (err) => { console.log(err); }
    });
    this.subscriptions.add(sub);
  }

  private getFeaturedReviews(): void {
    const sub = this._reviewService.getFeaturedReviews(9).subscribe({
      next: (res) => {
        this.featuredReviews = res.data.reviews;
         this._cdr.detectChanges();
         setTimeout(() => this.onReviewsScroll());
      },
      error: (err) => { console.log(err); }
    });
    this.subscriptions.add(sub);
  }

  private getCategories(): void {
    const sub = this._categoryService.getNavbarCategories().subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this._cdr.detectChanges();
      },
      error: (err) => { console.log(err); }
    });
    this.subscriptions.add(sub);
  }

  getCategoryParams(slug: string): { category?: string } {
    const category = this.categories.find(item => item.slug === slug);

    return category ? { category: category._id } : {};
  }

  scrollReviews(direction: 1 | -1): void {

    const track = this.reviewsTrack?.nativeElement;

    if (!track) {
      return;
    }

    const item = track.querySelector<HTMLElement>('.reviews__item');

    const step = item
      ? item.getBoundingClientRect().width + 20 
      : track.clientWidth;

    track.scrollBy({
      left: step * direction,
      behavior: 'smooth'
    });
  }

  onReviewsScroll(): void {

    const track = this.reviewsTrack?.nativeElement;

    if (!track) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;

    this.canScrollReviewsPrev = track.scrollLeft > 4;

    this.canScrollReviewsNext = track.scrollLeft < maxScroll - 4;

    this._cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
