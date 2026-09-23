import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

import { IProduct } from '../../core/models/product.model';
import { Rating } from '../rating/rating';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Rating],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnInit, OnDestroy {

  @Input({ required: true })
  product!: IProduct;

  @Input()
  badgeMode: 'auto' | 'newArrival' | 'topSales' | 'none' = 'auto';

  isLoggedIn = false;

  isAddingToCart = false;

  justAdded = false;

  private subscription = new Subscription();

  private justAddedTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private _cartService: CartService,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this._authService.checkIfLogin();

    this.subscription.add(
      this._authService
        .returnUserData()
        .subscribe(user => {

          this.isLoggedIn = !!user;

          this._cdr.detectChanges();

        })
    );

  }

  get showNewBadge(): boolean {
    if (this.badgeMode === 'none') {
      return false;
    }
    return this.badgeMode === 'newArrival'
      ? this.product.flags.newArrival
      : this.badgeMode === 'auto' && this.product.flags.newArrival;
  }

  get showTopSaleBadge(): boolean {
    if (this.badgeMode === 'none') {
      return false;
    }
    return this.badgeMode === 'topSales'
      ? this.product.flags.topSales
      : this.badgeMode === 'auto' && this.product.flags.topSales;
  }

  addToCart(event: Event): void {

    event.preventDefault();
    event.stopPropagation();

    if (this.product.isOutOfStock || this.isAddingToCart) {
      return;
    }

    this.isAddingToCart = true;

    this._cartService
      .addToCart(this.product, 1, this.isLoggedIn)
      .pipe(
        finalize(() => {

          this.isAddingToCart = false;

          this._cdr.detectChanges();

        })
      )
      .subscribe({

        next: () => {

          this.justAdded = true;

          clearTimeout(this.justAddedTimeout);

          this.justAddedTimeout = setTimeout(() => {

            this.justAdded = false;

            this._cdr.detectChanges();

          }, 1500);

        },

        error: error => {

          console.error('Add To Cart Error:', error);

        }

      });

  }

  ngOnDestroy(): void {

    this.subscription.unsubscribe();

    clearTimeout(this.justAddedTimeout);

  }

}
