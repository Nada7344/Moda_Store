import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ICart,
  ICartItem
} from '../../core/models/cart.model';

import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {

  cart: ICart | null = null;

  isLoggedIn = false;

  isLoading = false;

  updatingProductId: string | null = null;

  removingProductId: string | null = null;

  isClearing = false;

  errorMessage = '';

  constructor(
    private _cartService: CartService,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkLogin();
  }

  checkLogin(): void {

    this._authService.checkIfLogin();

    this._authService
      .returnUserData()
      .subscribe(user => {

        this.isLoggedIn = !!user;

        this.getCart();

      });

  }

  getCart(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this._cartService
      .getCart(this.isLoggedIn)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this._cdr.detectChanges();

        })
      )
      .subscribe({

        next: response => {

          this.cart = response.data.cart;

        },

        error: error => {

          console.error(
            'Get Cart Error:',
            error
          );

          this.cart = null;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your cart';

        }

      });

  }

  increaseQuantity(item: ICartItem): void {

    const productId = item.productId._id;

    if (
      item.quantity >=
      item.productId.stock
    ) {
      return;
    }

    this.updateQuantity(
      productId,
      item.quantity + 1
    );

  }

  decreaseQuantity(item: ICartItem): void {

    if (item.quantity <= 1) {
      return;
    }

    this.updateQuantity(
      item.productId._id,
      item.quantity - 1
    );

  }

  updateQuantity(
    productId: string,
    quantity: number
  ): void {

    if (quantity < 1) {
      return;
    }

    this.updatingProductId = productId;

    this.errorMessage = '';

    this._cartService
      .updateCartItem(
        productId,
        quantity,
        this.isLoggedIn
      )
      .pipe(
        finalize(() => {

          this.updatingProductId = null;

          this._cdr.detectChanges();

        })
      )
      .subscribe({

        next: response => {

          this.cart = response.data.cart;

        },

        error: error => {

          console.error(
            'Update Cart Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to update cart';

        }

      });

  }

  removeItem(productId: string): void {

    this.removingProductId = productId;

    this.errorMessage = '';

    this._cartService
      .removeCartItem(
        productId,
        this.isLoggedIn
      )
      .pipe(
        finalize(() => {

          this.removingProductId = null;

          this._cdr.detectChanges();

        })
      )
      .subscribe({

        next: response => {

          this.cart = response.data.cart;

        },

        error: error => {

          console.error(
            'Remove Cart Item Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to remove item';

        }

      });

  }

  clearCart(): void {

    if (
      !this.cart ||
      this.cart.products.length === 0
    ) {
      return;
    }

    this.isClearing = true;

    this.errorMessage = '';

    this._cartService
      .clearCart(this.isLoggedIn)
      .pipe(
        finalize(() => {

          this.isClearing = false;

          this._cdr.detectChanges();

        })
      )
      .subscribe({

        next: response => {

          this.cart = response.data.cart;

        },

        error: error => {

          console.error(
            'Clear Cart Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to clear cart';

        }

      });

  }

  getItemsCount(): number {

    if (!this.cart) {
      return 0;
    }

    return this.cart.products.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  }

  getSubtotal(): number {

    if (!this.cart) {
      return 0;
    }

    return this.cart.products.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );

  }

  getShipping(): number {

    return 0;

  }

  getTotal(): number {

    return (
      this.getSubtotal() +
      this.getShipping()
    );

  }

}
