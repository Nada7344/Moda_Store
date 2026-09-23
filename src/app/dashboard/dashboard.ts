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
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  ReportService
} from '../core/services/report.service';

import {
  OrderService
} from '../core/services/order.service';

import {
  ReviewService
} from '../core/services/review.service';

import {
  UserService
} from '../core/services/user.service';

import {
  INewUsersPoint,
  IReportOverview,
  ISalesPoint,
  ITopProduct
} from '../core/models/report.model';

import {
  IUser
} from '../core/models/user.model';

import {
  StatusBadge
} from '../shared/status-badge/status-badge';

interface IRecentOrder {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface IDelta {
  percent: number;
  direction: 'up' | 'down';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    FormsModule,
    StatusBadge
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  constructor(
    private _reportService: ReportService,
    private _orderService: OrderService,
    private _reviewService: ReviewService,
    private _userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {}

  admin: IUser | null = null;

  today = new Date();

  isLoading = true;
  errorMessage = '';

  rangeOptions = [7, 30, 90];
  rangeDays = 30;

  overview: IReportOverview | null = null;
  private _previousOverview: IReportOverview | null = null;

  newSignups = 0;
  private _previousNewSignups = 0;

  salesSeries: ISalesPoint[] = [];
  topProducts: ITopProduct[] = [];
  recentOrders: IRecentOrder[] = [];

  pendingOrdersCount = 0;
  pendingReviewsCount = 0;

  readonly statusGroups: { label: string; badgeStatus: string; keys: string[] }[] = [
    { label: 'Pending', badgeStatus: 'Pending', keys: ['Pending'] },
    { label: 'In Progress', badgeStatus: 'In Progress', keys: ['In Progress'] },
    { label: 'Shipped', badgeStatus: 'Shipped', keys: ['Shipped'] },
    { label: 'Delivered', badgeStatus: 'Delivered', keys: ['Delivered'] },
    {
      label: 'Cancelled',
      badgeStatus: 'Cancelled by Admin',
      keys: ['Cancelled by Customer', 'Cancelled by Admin', 'Rejected'],
    },
    { label: 'Refunded', badgeStatus: 'Refunded', keys: ['Refunded'] },
  ];

  ngOnInit(): void {

    this.loadAdminProfile();
    this.loadDashboard();
    this.loadPendingAlerts();

  }

  loadAdminProfile(): void {

    this._userService.getProfile().subscribe({

      next: response => {

        this.admin = response.data.user;

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('DASHBOARD ADMIN PROFILE ERROR:', error);

      }

    });

  }

  loadPendingAlerts(): void {

    forkJoin({

      orders: this._orderService.getOrdersAdmin({
        status: 'Pending',
        page: 1,
        size: 1,
      }),

      reviews: this._reviewService.getReviewsAdmin({
        status: 'Pending',
        page: 1,
        size: 1,
      }),

    })
      .subscribe({

        next: result => {

          this.pendingOrdersCount = result.orders.data.docsCount || 0;
          this.pendingReviewsCount = result.reviews.data.docsCount || 0;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error('DASHBOARD PENDING ALERTS ERROR:', error);

        }

      });

  }

  loadDashboard(): void {

    this.isLoading = true;
    this.errorMessage = '';

    const { from, to } = this._rangeToDates(this.rangeDays);
    const { from: prevFrom, to: prevTo } = this._previousRangeToDates(this.rangeDays);

    forkJoin({

      overview: this._reportService.getOverview({ from, to }),
      previousOverview: this._reportService.getOverview({ from: prevFrom, to: prevTo }),

      sales: this._reportService.getSales({ from, to }, 'week'),

      topProducts: this._reportService.getTopProducts({ from, to }, 4),

      newUsers: this._reportService.getNewUsers({ from, to }, 'day'),
      previousNewUsers: this._reportService.getNewUsers({ from: prevFrom, to: prevTo }, 'day'),

      recentOrders: this._orderService.getOrdersAdmin({ page: 1, size: 4 }),

    })
      .pipe(

        finalize(() => {

          this.isLoading = false;
          this._cdr.detectChanges();

        })

      )
      .subscribe({

        next: result => {

          this.overview = result.overview.data.overview;
          this._previousOverview = result.previousOverview.data.overview;

          this.salesSeries = result.sales.data.sales.series;
          this.topProducts = result.topProducts.data.topProducts;

          this.newSignups = this._sumNewUsers(result.newUsers.data.newUsers.series);
          this._previousNewSignups = this._sumNewUsers(result.previousNewUsers.data.newUsers.series);

          this.recentOrders = (result.recentOrders.data.result as unknown as IRecentOrder[]) || [];

        },

        error: error => {

          console.error('DASHBOARD LOAD ERROR:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load the dashboard right now.';

        }

      });

  }

  onRangeChange(days: number): void {

    if (days === this.rangeDays) {

      return;

    }

    this.rangeDays = days;

    this.loadDashboard();

  }

  private _rangeToDates(days: number): { from: string; to: string } {

    const to = new Date();
    const from = new Date();

    from.setDate(from.getDate() - days);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };

  }

  private _previousRangeToDates(days: number): { from: string; to: string } {

    const to = new Date();
    to.setDate(to.getDate() - days);

    const from = new Date(to);
    from.setDate(from.getDate() - days);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };

  }

  get hasPendingAlerts(): boolean {

    return this.pendingOrdersCount > 0 || this.pendingReviewsCount > 0;

  }

  get greeting(): string {

    const hour = this.today.getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';

  }

  get adminFirstName(): string {

    return this.admin?.name?.trim().split(/\s+/)[0] || 'there';

  }

  get salesDelta(): IDelta | null {

    return this._computeDelta(
      this.overview?.totalRevenue || 0,
      this._previousOverview?.totalRevenue || 0
    );

  }

  get pendingOrdersDelta(): IDelta | null {

    return this._computeDelta(
      this.overview?.ordersByStatus?.['Pending'] || 0,
      this._previousOverview?.ordersByStatus?.['Pending'] || 0
    );

  }

  get ordersDelta(): IDelta | null {

    return this._computeDelta(
      this.overview?.totalOrders || 0,
      this._previousOverview?.totalOrders || 0
    );

  }

  get newSignupsDelta(): IDelta | null {

    return this._computeDelta(
      this.newSignups,
      this._previousNewSignups
    );

  }

  private _computeDelta(current: number, previous: number): IDelta | null {

    if (!previous) {

      return null;

    }

    const diff = ((current - previous) / previous) * 100;

    return {
      percent: Math.abs(diff),
      direction: diff >= 0 ? 'up' : 'down',
    };

  }

  statusGroupCount(keys: string[]): number {

    if (!this.overview) {

      return 0;

    }

    return keys.reduce(
      (total, key) => total + (this.overview!.ordersByStatus[key] || 0),
      0
    );

  }

  get maxSalesRevenue(): number {

    return Math.max(1, ...this.salesSeries.map(point => point.revenue));

  }

  barHeight(point: ISalesPoint): number {

    return Math.round((point.revenue / this.maxSalesRevenue) * 100);

  }

  isPeakBar(point: ISalesPoint): boolean {

    return point.revenue === this.maxSalesRevenue && point.revenue > 0;

  }

  orderCode(orderId: string): string {

    return '#' + orderId.slice(-6).toUpperCase();

  }

  customerName(order: IRecentOrder): string {

    if (typeof order.userId === 'string') {

      return 'Customer';

    }

    return order.userId?.name || 'Customer';

  }

  private _sumNewUsers(series: INewUsersPoint[]): number {

    return series.reduce(
      (total, point) => total + (point.newUsers || 0),
      0
    );

  }

}
