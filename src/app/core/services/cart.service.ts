import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  IAddToCart,
  ICart,
  ICartProduct,
  ICartResponse,
  IGuestCartItem,
  ISyncCartResponse
} from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private apiURL = environment.apiURL + '/cart';

  private guestCartKey = 'guest_cart';

  private cartCountSubject =
    new BehaviorSubject<number>(0);

  cartCount$ =
    this.cartCountSubject.asObservable();

  private cartSubject =
    new BehaviorSubject<ICart | null>(null);

  cart$ =
    this.cartSubject.asObservable();

  private drawerOpenSubject =
    new BehaviorSubject<boolean>(false);

  drawerOpen$ =
    this.drawerOpenSubject.asObservable();

  openDrawer(): void {

    this.drawerOpenSubject.next(true);

  }

  closeDrawer(): void {

    this.drawerOpenSubject.next(false);

  }

  constructor(
    private _http: HttpClient
  ) {

    this.updateGuestCartCount();

  }

  private getGuestCart(): IGuestCartItem[] {

    const cart =
      localStorage.getItem(
        this.guestCartKey
      );

    if (!cart) {
      return [];
    }

    try {

      return JSON.parse(cart);

    } catch {

      return [];

    }

  }

  private saveGuestCart(
    cart: IGuestCartItem[]
  ): void {

    localStorage.setItem(
      this.guestCartKey,
      JSON.stringify(cart)
    );

  }

  private clearGuestCart(): void {

    localStorage.removeItem(
      this.guestCartKey
    );

  }

  getGuestCartItems(): IGuestCartItem[] {

    return this.getGuestCart();

  }

  private updateCartCount(
    cart: ICart
  ): void {

    this.cartSubject.next(cart);

    const count =
      cart.products.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );

    this.cartCountSubject.next(count);

  }

  private updateGuestCartCount(): void {

    const cart =
      this.getGuestCart();

    const count =
      cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );

    this.cartCountSubject.next(count);

  }

  private addToGuestCart(
    product: ICartProduct,
    quantity: number
  ): void {

    const cart =
      this.getGuestCart();

    const existingItem =
      cart.find(
        item =>
          item.productId === product._id
      );

    if (existingItem) {

      const newQuantity =
        existingItem.quantity + quantity;

      existingItem.quantity =
        Math.min(
          newQuantity,
          product.stock
        );

      existingItem.product =
        product;

    } else {

      cart.push({

        productId: product._id,

        quantity:
          Math.min(
            quantity,
            product.stock
          ),

        product

      });

    }

    this.saveGuestCart(cart);

    this.updateGuestCartCount();

  }

  addToCart(
    product: ICartProduct,
    quantity: number,
    isLoggedIn: boolean
  ): Observable<ICartResponse> {

    if (!isLoggedIn) {

      this.addToGuestCart(
        product,
        quantity
      );

      const cart =
        this.createGuestCart();

      this.updateCartCount(cart);

      this.openDrawer();

      return of({

        status: 200,

        message:
          'Product added to guest cart',

        data: {
          cart
        }

      });

    }

    const data: IAddToCart = {

      productId:
        product._id,

      quantity

    };

    return this._http
      .post<ICartResponse>(
        this.apiURL,
        data
      )
      .pipe(
        tap(
          response => {

            this.updateCartCount(
              response.data.cart
            );

            this.openDrawer();

          }
        )
      );

  }

  getCart(
    isLoggedIn: boolean
  ): Observable<ICartResponse> {

    if (!isLoggedIn) {

      const cart =
        this.createGuestCart();

      this.updateCartCount(cart);

      return of({

        status: 200,

        message:
          'Guest cart',

        data: {
          cart
        }

      });

    }

    return this._http
      .get<ICartResponse>(
        this.apiURL
      )
      .pipe(
        tap(
          response =>
            this.updateCartCount(
              response.data.cart
            )
        )
      );

  }

  updateCartItem(
    productId: string,
    quantity: number,
    isLoggedIn: boolean
  ): Observable<ICartResponse> {

    if (!isLoggedIn) {

      const cart =
        this.getGuestCart();

      const item =
        cart.find(
          product =>
            product.productId === productId
        );

      if (item) {

        item.quantity =
          Math.min(
            quantity,
            item.product.stock
          );

      }

      this.saveGuestCart(cart);

      const guestCart =
        this.createGuestCart();

      this.updateCartCount(guestCart);

      return of({

        status: 200,

        message:
          'Guest cart updated',

        data: {
          cart: guestCart
        }

      });

    }

    return this._http
      .patch<ICartResponse>(
        `${this.apiURL}/${productId}`,
        {
          quantity
        }
      )
      .pipe(
        tap(
          response =>
            this.updateCartCount(
              response.data.cart
            )
        )
      );

  }

  removeCartItem(
    productId: string,
    isLoggedIn: boolean
  ): Observable<ICartResponse> {

    if (!isLoggedIn) {

      const cart =
        this
          .getGuestCart()
          .filter(
            item =>
              item.productId !== productId
          );

      this.saveGuestCart(cart);

      const guestCart =
        this.createGuestCart();

      this.updateCartCount(guestCart);

      return of({

        status: 200,

        message:
          'Item removed',

        data: {
          cart: guestCart
        }

      });

    }


    return this._http
      .delete<ICartResponse>(
        `${this.apiURL}/${productId}`
      )
      .pipe(
        tap(
          response =>
            this.updateCartCount(
              response.data.cart
            )
        )
      );

  }

  clearCart(
    isLoggedIn: boolean
  ): Observable<ICartResponse> {


    if (!isLoggedIn) {

      this.clearGuestCart();

      const guestCart =
        this.createGuestCart();

      this.updateCartCount(guestCart);

      return of({

        status: 200,

        message:
          'Guest cart cleared',

        data: {
          cart: guestCart
        }

      });

    }


    return this._http
      .delete<ICartResponse>(
        this.apiURL
      )
      .pipe(
        tap(
          response =>
            this.updateCartCount(
              response.data.cart
            )
        )
      );

  }

  private createGuestCart(): ICart {

    const guestItems =
      this.getGuestCart();

    return {

      userId: 'guest',

      products:
        guestItems.map(
          item => ({

            productId:
              item.product,

            quantity:
              item.quantity,

            price:
              item.product.price

          })
        )

    };

  }


  syncGuestCart() {

    const guestCart =
      this.getGuestCart();

    if (guestCart.length === 0) {

      return null;

    }

    const products =
      guestCart.map(
        item => ({

          productId:
            item.productId,

          quantity:
            item.quantity

        })
      );

    return this._http
      .post<ISyncCartResponse>(
        `${this.apiURL}/sync`,
        {
          products
        }
      );

  }


  removeGuestCart(): void {

    this.clearGuestCart();

    this.cartCountSubject.next(0);

  }


  setCartCount(
    cart: ICart
  ): void {

    this.updateCartCount(cart);

  }

}
