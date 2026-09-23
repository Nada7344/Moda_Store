import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  ICart,
  ICartItem
} from '../../core/models/cart.model';

import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart-drawer',

  imports: [
    DecimalPipe,
    RouterLink
  ],

  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
})
export class CartDrawer implements OnInit, OnDestroy {

  isOpen = false;

  cart: ICart | null = null;

  isLoggedIn = false;

  updatingProductId: string | null = null;

  removingProductId: string | null = null;

  private subscription = new Subscription();

  constructor(
    private _cartService: CartService,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.subscription.add(
      this._authService
        .returnUserData()
        .subscribe(user => {

          this.isLoggedIn = !!user;

        })
    );

   
    this.subscription.add(
      this._cartService.cart$
        .subscribe(cart => {

          this.cart = cart;

          this._cdr.detectChanges();

        })
    );

    this.subscription.add(
      this._cartService.drawerOpen$
        .subscribe(isOpen => {

          this.isOpen = isOpen;

          this._cdr.detectChanges();

        })
    );

  }

  ngOnDestroy(): void {

    this.subscription.unsubscribe();

  }

  get itemsCount(): number {

    if (!this.cart) {
      return 0;
    }

    return this.cart.products.reduce(
      (total, item) => total + item.quantity,
      0
    );

  }

  get estimatedTotal(): number {

    if (!this.cart) {
      return 0;
    }

    return this.cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  }

  close(): void {

    this._cartService.closeDrawer();

  }

  increaseQuantity(item: ICartItem): void {

    if (item.quantity >= item.productId.stock) {
      return;
    }

    this.updateQuantity(
      item.productId._id,
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

    this.updatingProductId = productId;

    this._cartService
      .updateCartItem(
        productId,
        quantity,
        this.isLoggedIn
      )
      .subscribe({

        next: () => {

          this.updatingProductId = null;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error(
            'Update Cart Item Error:',
            error
          );

          this.updatingProductId = null;

          this._cdr.detectChanges();

        }

      });

  }

  removeItem(productId: string): void {

    this.removingProductId = productId;

    this._cartService
      .removeCartItem(
        productId,
        this.isLoggedIn
      )
      .subscribe({

        next: () => {

          this.removingProductId = null;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error(
            'Remove Cart Item Error:',
            error
          );

          this.removingProductId = null;

          this._cdr.detectChanges();

        }

      });

  }

}
