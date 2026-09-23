import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../core/models/order.model';
import { StatusBadge } from '../../shared/status-badge/status-badge';

@Component({
  selector: 'app-admin-orders',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StatusBadge
  ],

  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) {}

  orders: IOrder[] = [];

  isLoading = true;
  errorMessage = '';

  readonly statuses = [
    'Pending',
    'In Progress',
    'Shipped',
    'Delivered',
    'Cancelled by Customer',
    'Cancelled by Admin',
    'Rejected',
    'Refunded',
  ];

  statusFilter = '';
  fromDate = '';
  toDate = '';

  searchTerm = '';

  page = 1;
  size = 10;
  pages = 1;
  docsCount = 0;

  ngOnInit(): void {

    const statusFromUrl = this._route.snapshot.queryParamMap.get('status');

    if (statusFromUrl && this.statuses.includes(statusFromUrl)) {

      this.statusFilter = statusFromUrl;

    }

    this.loadOrders();

  }

  loadOrders(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._orderService
      .getOrdersAdmin({
        page: this.page,
        size: this.size,
        status: this.statusFilter || undefined,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
      })
      .subscribe({

        next: response => {

          this.orders = response.data.result || [];
          this.pages = response.data.pages || 1;
          this.docsCount = response.data.docsCount || 0;
          this.page = response.data.currentPage || this.page;

          this.isLoading = false;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error('ADMIN ORDERS — LOAD ERROR:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load orders right now.';

          this.isLoading = false;

          this._cdr.detectChanges();

        }

      });

  }

  onStatusFilterChange(value: string): void {

    this.statusFilter = value;
    this.page = 1;

    this.loadOrders();

  }

  onDateFilterChange(): void {

    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {

      return;

    }

    this.page = 1;

    this.loadOrders();

  }

  get visibleOrders(): IOrder[] {

    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {

      return this.orders;

    }

    return this.orders.filter(order => {

      const code = this.orderCode(order._id).toLowerCase();
      const customer = this.customerName(order).toLowerCase();
      const email =
        typeof order.userId === 'string' ? '' : (order.userId?.email || '').toLowerCase();

      return code.includes(term) || customer.includes(term) || email.includes(term);

    });

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.pages || page === this.page) {

      return;

    }

    this.page = page;

    this.loadOrders();

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

  orderCode(orderId: string): string {

    return '#' + orderId.slice(-6).toUpperCase();

  }

  customerName(order: IOrder): string {

    if (typeof order.userId === 'string') {

      return 'Customer';

    }

    return order.userId?.name || 'Customer';

  }

  itemsCount(order: IOrder): number {

    return (order.products || []).reduce((total, item) => total + item.quantity, 0);

  }

}
