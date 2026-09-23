import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  environment
} from '../../../environments/environment';

import {
  OrderCard,
  IOrderCardData
} from '../../shared/order-card/order-card';

import {
  Pagination
} from '../../shared/pagination/pagination';

interface IOrdersResponse {

  status: number;

  message: string;

  data: {

    docsCount: number;

    limit: number;

    pages: number;

    currentPage: number;

    result: IOrderCardData[];

  };

}

@Component({
  selector: 'app-orders',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    OrderCard,
    Pagination
  ],

  templateUrl: './orders.html',

  styleUrl: './orders.css',
})
export class Orders implements OnInit {

  private apiURL =
    environment.apiURL + '/orders';

  orders: IOrderCardData[] = [];

  currentPage = 1;

  totalPages = 0;

  pageSize = 10;

  isLoading = true;

  errorMessage = '';

  constructor(

    private _http: HttpClient,

    private _authService: AuthService,

    private _router: Router,

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

        if (!user) {

          this._router.navigate(['/login']);

          return;

        }

        this.getOrders();

      });

  }

  getOrders(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this._http
      .get<IOrdersResponse>(
        this.apiURL,
        {
          params: {
            page: this.currentPage,
            size: this.pageSize
          }
        }
      )
      .pipe(

        finalize(() => {

          this.isLoading = false;

          this._cdr.detectChanges();

        })

      )
      .subscribe({

        next: response => {

          this.orders =
            response.data.result || [];

          this.totalPages =
            response.data.pages;

          this.currentPage =
            response.data.currentPage;

        },

        error: error => {

          console.error(
            'Get Orders Error:',
            error
          );

          this.orders = [];

          this.totalPages = 0;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your orders.';

        }

      });

  }

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {

      return;

    }

    this.currentPage = page;

    this.getOrders();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

}
