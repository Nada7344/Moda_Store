import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  DecimalPipe
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

import {
  forkJoin,
  finalize
} from 'rxjs';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  CartService
} from '../../core/services/cart.service';

import {
  ProductService
} from '../../core/services/product.service';

import {
  ICart
} from '../../core/models/cart.model';

import {
  environment
} from '../../../environments/environment';
import { ICreateOrderRequest } from '../../core/models/order.model';

interface IAddress {

  _id: string;

  label: 'Home' | 'Work' | 'Other';

  street: string;

  city: string;

  state?: string;

  country: string;

  postalCode?: string;

  building?: string;

  apartment?: string;

  phone?: string;

  isDefault: boolean;
}

interface IUserResponse {

  status: number;

  message: string;

  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      address: IAddress[];
    };
  };
}

interface IOrderResponse {

  status: number;

  message: string;

  data: {
    order: {
      _id: string;
      totalPrice: number;
    };
  };
}

interface INewAddress {

  label: 'Home' | 'Work' | 'Other';

  street: string;

  city: string;

  building: string;

  apartment: string;

  phone: string;

  country: string;

  state: string;

  postalCode: string;
}

@Component({
  selector: 'app-checkout',

  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    RouterLink
  ],

  templateUrl: './checkout.html',

  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {

  private userApiURL =
    environment.apiURL + '/user';

  private orderApiURL =
    environment.apiURL + '/orders';

  cart: ICart | null = null;

  addresses: IAddress[] = [];

  selectedAddressId: string | null = null;

  isAddingNewAddress = false;

  saveNewAddress = false;

  isLoading = true;

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  newAddress: INewAddress = {

    label: 'Home',

    street: '',

    city: '',

    building: '',

    apartment: '',

    phone: '',

    country: 'Egypt',

    state: '',

    postalCode: ''

  };

  shipping = 0;

  isShippingLoading = false;

  constructor(

    private _http: HttpClient,

    private _authService: AuthService,

    private _cartService: CartService,

    private _productService: ProductService,

    private _router: Router,

    private _cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {

    this.loadCheckout();

  }

  loadCheckout(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this._authService.checkIfLogin();

    this._authService
      .returnUserData()
      .subscribe(userId => {

        if (!userId) {

          this._router.navigate(['/login']);

          return;

        }

        this.loadUser();

        this.loadCart();

      });

  }

  loadUser(): void {

    this._http
      .get<IUserResponse>(
        `${this.userApiURL}/profile`
      )
      .subscribe({

        next: response => {

          this.addresses =
            response.data.user.address || [];

          const defaultAddress =
            this.addresses.find(
              address =>
                address.isDefault
            );

          if (defaultAddress) {

            this.selectedAddressId =
              defaultAddress._id;

          }
          else if (this.addresses.length > 0) {

            this.selectedAddressId =
              this.addresses[0]._id;

          }
          else {

            this.isAddingNewAddress = true;

          }

          this.finishLoading();

        },

        error: error => {

          console.error(
            'Get Profile Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your profile.';

          this.finishLoading();

        }

      });

  }
  loadCart(): void {

    this._cartService
      .getCart(true)
      .subscribe({

        next: response => {

          this.cart =
            response.data.cart;

          if (
            !this.cart ||
            this.cart.products.length === 0
          ) {

          }

          this.loadShipping();

        },

        error: error => {

          console.error(
            'Get Cart Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your cart.';

          this.finishLoading();

        }

      });

  }
  loadShipping(): void {

    if (
      !this.cart ||
      this.cart.products.length === 0
    ) {

      this.shipping = 0;

      this.finishLoading();

      return;

    }

    this.isShippingLoading = true;

    const requests =
      this.cart.products.map(
        item =>
          this._productService
            .getProductBySlug(
              item.productId.slug
            )
      );

    forkJoin(requests)
      .pipe(

        finalize(() => {

          this.isShippingLoading = false;

          this.finishLoading();

        })

      )
      .subscribe({

        next: responses => {

          this.shipping =
            responses.reduce(
              (
                total,
                response
              ) => {

                return total +
                  (response.data.product.shippingPrice || 0);

              },

              0
            );

        },

        error: error => {

          console.error(
            'Get Shipping Error:',
            error
          );

          this.errorMessage =
            'Unable to calculate shipping. Please try again.';

        }

      });

  }
  finishLoading(): void {

    this.isLoading = false;

    this._cdr.detectChanges();

  }


  selectAddress(
    addressId: string
  ): void {

    this.selectedAddressId =
      addressId;

    this.isAddingNewAddress = false;

    this.errorMessage = '';

  }
  showNewAddress(): void {

    this.isAddingNewAddress = true;

    this.selectedAddressId = null;

    this.errorMessage = '';

  }
  hideNewAddress(): void {

    if (this.addresses.length > 0) {

      const defaultAddress =
        this.addresses.find(
          address =>
            address.isDefault
        );

      this.selectedAddressId =
        defaultAddress?._id ||
        this.addresses[0]._id;

      this.isAddingNewAddress =
        false;

    }

  }

  private buildAddressPayload(): {
    label: 'home' | 'work' | 'other';
    street: string;
    city: string;
    country: string;
    state?: string;
    postalCode?: string;
    building?: string;
    apartment?: string;
    phone?: string;
  } {

    return {

      label:
        this.newAddress.label.toLowerCase() as 'home' | 'work' | 'other',

      street:
        this.newAddress.street.trim(),

      city:
        this.newAddress.city.trim(),

      country:
        this.newAddress.country.trim() ||
        'Egypt',

      ...(this.newAddress.state.trim() && {
        state: this.newAddress.state.trim()
      }),

      ...(this.newAddress.postalCode.trim() && {
        postalCode: this.newAddress.postalCode.trim()
      }),

      ...(this.newAddress.building.trim() && {
        building: this.newAddress.building.trim()
      }),

      ...(this.newAddress.apartment.trim() && {
        apartment: this.newAddress.apartment.trim()
      }),

      ...(this.newAddress.phone.trim() && {
        phone: this.newAddress.phone.trim()
      })

    };

  }

  addAddress(): void {

    this.errorMessage = '';

    if (
      !this.newAddress.street.trim()
    ) {

      this.errorMessage =
        'Please enter your street.';

      return;

    }

    if (
      !this.newAddress.city.trim()
    ) {

      this.errorMessage =
        'Please enter your city.';

      return;

    }

    this.isSubmitting = true;

    const addressPayload = {

      ...this.buildAddressPayload(),

      isDefault:
        this.saveNewAddress

    };


    if (this.saveNewAddress) {

      this._http
        .post<{
          status: number;
          message: string;
          data: {
            address: IAddress[];
          };
        }>(
          `${this.userApiURL}/address`,
          addressPayload
        )
        .pipe(

          finalize(() => {

            this.isSubmitting = false;

          })

        )
        .subscribe({

          next: response => {

            this.addresses =
              response.data.address || [];

            const lastAddress =
              this.addresses[
                this.addresses.length - 1
              ];

            if (lastAddress) {

              this.selectedAddressId =
                lastAddress._id;

            }

            this.isAddingNewAddress =
              false;

            this.resetNewAddress();

          },

          error: error => {

            console.error(
              'Add Address Error:',
              error
            );

            this.errorMessage =
              error?.error?.message ||
              'Unable to save address.';

          }

        });

      return;

    }

    this.isSubmitting = false;

  }

  resetNewAddress(): void {

    this.newAddress = {

      label: 'Home',

      street: '',

      city: '',

      building: '',

      apartment: '',

      phone: '',

      country: 'Egypt',

      state: '',

      postalCode: ''

    };

    this.saveNewAddress = false;

  }

  placeOrder(): void {

    this.errorMessage = '';

    this.successMessage = '';

    if (
      !this.cart ||
      this.cart.products.length === 0
    ) {

      this.errorMessage =
        'Your cart is empty.';

      return;

    }

    if (
      !this.isAddingNewAddress &&
      this.selectedAddressId
    ) {

      this.submitOrder({

        addressId:
          this.selectedAddressId

      });

      return;

    }

    if (this.isAddingNewAddress) {

      if (
        !this.newAddress.street.trim()
      ) {

        this.errorMessage =
          'Please enter your street.';

        return;

      }

      if (
        !this.newAddress.city.trim()
      ) {

        this.errorMessage =
          'Please enter your city.';

        return;

      }

      this.submitOrder({
        address: this.buildAddressPayload()
      });

      return;

    }

    this.errorMessage =
      'Please select a shipping address.';

  }

private submitOrder(data: ICreateOrderRequest): void {

    this.isSubmitting = true;

    this._http
      .post<IOrderResponse>(
        this.orderApiURL,
        data
      )
      .pipe(

        finalize(() => {

          this.isSubmitting = false;

          this._cdr.detectChanges();

        })

      )
      .subscribe({

        next: response => {

          this.successMessage =
            'Your order has been placed successfully.';


          this._cartService
            .getCart(true)
            .subscribe();



          this._router.navigate([
            '/orders'
          ]);

        },

        error: error => {

          console.error(
            'Create Order Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to place your order.';

        }

      });

  }

  getItemsCount(): number {

    if (!this.cart) {

      return 0;

    }

    return this.cart.products.reduce(
      (
        total,
        item
      ) =>
        total + item.quantity,

      0
    );

  }
  getSubtotal(): number {

    if (!this.cart) {

      return 0;

    }

    return this.cart.products.reduce(
      (
        total,
        item
      ) =>
        total +
        item.price *
        item.quantity,

      0
    );

  }


  getTotal(): number {

    return (
      this.getSubtotal() +
      this.shipping
    );

  }



  getAddressLines(
    address: IAddress
  ): string {

    const firstLine =
      [
        address.street,

        address.building
          ? `Building ${address.building}`
          : '',

        address.apartment
          ? `Apt ${address.apartment}`
          : ''
      ]
        .filter(Boolean)
        .join(', ');

    const secondLine =
      [
        address.city,

        address.state,

        address.country
      ]
        .filter(Boolean)
        .join(', ');

    return `${firstLine}\n${secondLine}`;

  }

}
