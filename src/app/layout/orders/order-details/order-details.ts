import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  IOrder,
  IOrderProduct
} from '../../../core/models/order.model';

import {
  OrderService
} from '../../../core/services/order.service';

@Component({
  selector: 'app-order-details',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe
  ],

  templateUrl: './order-details.html',

  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit {

  order: IOrder | null = null;

  loading = true;

  isCancelling = false;

  errorMessage = '';

  successMessage = '';

  get formattedOrderId(): string {

    return this.order
      ? '#' + this.order._id.slice(-6).toUpperCase()
      : '';

  }

  constructor(
    private _route: ActivatedRoute,
    private _orderService: OrderService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const orderId =
      this._route.snapshot.paramMap.get(
        'orderId'
      );

    if (!orderId) {

      this.errorMessage =
        'Order not found';

      this.loading = false;

      this._cdr.detectChanges();

      return;
    }

    this.loadOrder(orderId);
  }

  loadOrder(orderId: string): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this._cdr.detectChanges();

    this._orderService
      .getOrderById(orderId)
      .subscribe({

        next: (response) => {

          this.order =
            response.data.order;

          this.loading = false;

          this._cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'GET ORDER DETAILS ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load order details';

          this.loading = false;

          this._cdr.detectChanges();
        }

      });
  }

  getProductImage(
    product: IOrderProduct
  ): string {

    return (
      product.productId?.images?.[0]?.secure_url ||
      ''
    );
  }

  getProductName(
    product: IOrderProduct
  ): string {

    return (
      product.productId?.name ||
      'Product'
    );
  }

  getProductSlug(
    product: IOrderProduct
  ): string {

    return (
      product.productId?.slug ||
      ''
    );
  }

  getProductTotal(
    product: IOrderProduct
  ): number {

    return (
      product.price *
      product.quantity
    );
  }

  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  canCancelOrder(): boolean {

    return (
      !this.isCancelling &&
      (
        this.order?.status === 'Pending' ||
        this.order?.status === 'In Progress'
      )
    );
  }

  cancelOrder(): void {

    if (
      !this.order ||
      !this.canCancelOrder()
    ) {

      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to cancel this order?'
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    this.isCancelling = true;

    this._cdr.detectChanges();

    this._orderService
      .cancelOrder(
        this.order._id
      )
      .subscribe({

        next: (response) => {

          this.order =
            response.data.order;

          this.successMessage =
            'Order cancelled successfully';

          this.isCancelling = false;

          this._cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'CANCEL ORDER ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to cancel order';

          this.isCancelling = false;

          this._cdr.detectChanges();
        }

      });
  }

}
