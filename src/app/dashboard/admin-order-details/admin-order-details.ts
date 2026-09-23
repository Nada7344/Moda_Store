import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderService } from '../../core/services/order.service';
import { IOrder, ITimelineStep } from '../../core/models/order.model';
import { StatusBadge } from '../../shared/status-badge/status-badge';


const ALL_STATUSES = [
  'Pending',
  'In Progress',
  'Shipped',
  'Delivered',
  'Cancelled by Customer',
  'Cancelled by Admin',
  'Rejected',
  'Refunded',
];

const HAPPY_PATH = ['Pending', 'In Progress', 'Shipped', 'Delivered'];


@Component({
  selector: 'app-admin-order-details',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StatusBadge
  ],

  templateUrl: './admin-order-details.html',
  styleUrl: './admin-order-details.css',
})
export class AdminOrderDetails implements OnInit {

  constructor(
    private _route: ActivatedRoute,
    private _orderService: OrderService,
    private _cdr: ChangeDetectorRef
  ) {}

  orderId: string | null = null;
  order: IOrder | null = null;

  isLoading = true;
  errorMessage = '';

  selectedStatus = '';
  isUpdating = false;
  updateError = '';

  ngOnInit(): void {

    this.orderId = this._route.snapshot.paramMap.get('orderId');

    if (this.orderId) {

      this.loadOrder();

    } else {

      this.isLoading = false;
      this.errorMessage = 'No order id was provided.';

    }

  }

  loadOrder(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._orderService.getOrderByIdAdmin(this.orderId!).subscribe({

      next: response => {

        this.order = response.data.order;
        this.selectedStatus = this.order.status;

        this.isLoading = false;

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN ORDER DETAILS — LOAD ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load this order right now.';

        this.isLoading = false;

        this._cdr.detectChanges();

      }

    });

  }

  get allowedNextStatuses(): string[] {

    if (!this.order) {

      return [];

    }

    return ALL_STATUSES.filter(status => status !== this.order!.status);

  }

  get canUpdateStatus(): boolean {

    return this.allowedNextStatuses.length > 0;

  }

  updateStatus(): void {

    if (
      !this.order ||
      this.isUpdating ||
      !this.selectedStatus ||
      this.selectedStatus === this.order.status
    ) {

      return;

    }

    this.isUpdating = true;
    this.updateError = '';

    this._orderService.updateOrderStatusAdmin(this.order._id, this.selectedStatus).subscribe({

      next: response => {

        this.order = response.data.order;
        this.selectedStatus = this.order.status;

        this.isUpdating = false;

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN ORDER DETAILS — UPDATE STATUS ERROR:', error);

        this.updateError =
          error?.error?.message ||
          'Unable to update the status right now.';

        this.isUpdating = false;

        this._cdr.detectChanges();

      }

    });

  }

  get timelineSteps(): ITimelineStep[] {

    if (!this.order) {

      return [];

    }

    const placedTime = this.order.createdAt
      ? this.formatDateTime(this.order.createdAt)
      : '';

    const updatedTime = this.order.updatedAt
      ? this.formatDateTime(this.order.updatedAt)
      : '';

    if (!HAPPY_PATH.includes(this.order.status)) {

      return [
        { title: 'Order placed', time: placedTime, state: 'done' },
        { title: this.order.status, time: updatedTime, state: 'current' },
      ];

    }

    const currentIndex = HAPPY_PATH.indexOf(this.order.status);

    return HAPPY_PATH.map((status, index) => {

      const title = status === 'Pending' ? 'Order placed' : `Moved to ${status}`;

      if (index < currentIndex) {

        return { title, time: 'Completed', state: 'done' as const };

      }

      if (index === currentIndex) {

        return {
          title,
          time: index === 0 ? placedTime : updatedTime,
          state: 'done' as const,
        };

      }

      return { title, time: 'Pending', state: 'upcoming' as const };

    });

  }



  orderCode(): string {

    return this.order ? '#' + this.order._id.slice(-6).toUpperCase() : '';

  }

  customerName(): string {

    if (!this.order || typeof this.order.userId === 'string') {

      return 'Customer';

    }

    return this.order.userId?.name || 'Customer';

  }

  customerEmail(): string {

    if (!this.order || typeof this.order.userId === 'string') {

      return '';

    }

    return this.order.userId?.email || '';

  }

  customerInitials(): string {

    const name = this.customerName();

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'C';

  }

  itemsCount(): number {

    return (this.order?.products || []).reduce((total, item) => total + item.quantity, 0);

  }

  subtotal(): number {

    return (this.order?.products || []).reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  }

  shippingCost(): number {

    if (!this.order) {

      return 0;

    }

    return Math.max(0, this.order.totalPrice - this.subtotal());

  }

  addressLine1(): string {

    if (!this.order) {

      return '';

    }

    const address = this.order.address;
    const parts = [address?.street];

    if (address?.building) parts.push(`Building ${address.building}`);
    if (address?.apartment) parts.push(`Apt ${address.apartment}`);

    return parts.filter(Boolean).join(', ');

  }

  addressLine2(): string {

    if (!this.order) {

      return '';

    }

    const address = this.order.address;

    return [address?.city, address?.state, address?.country]
      .filter(Boolean)
      .join(', ');

  }

  private formatDateTime(iso: string): string {

    const date = new Date(iso);

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  }

}
