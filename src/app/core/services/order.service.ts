import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  IOrder,
  IOrderResponse,
  IOrdersResponse,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiURL = environment.apiURL + '/orders';

  constructor(private _http: HttpClient) {}

  getMyOrders(page = 1, size = 10): Observable<any> {
    return this._http.get(`${this.apiURL}`, {
      params: {
        page,
        size,
      },
    });
  }

  getOrderById(orderId: string): Observable<IOrderResponse> {
    return this._http.get<IOrderResponse>(
      `${this.apiURL}/${orderId}`
    );
  }

  cancelOrder(orderId: string): Observable<IOrderResponse> {
    return this._http.patch<IOrderResponse>(
      `${this.apiURL}/${orderId}/cancel`,
      {}
    );
  }

  getOrdersAdmin(
    filters: {
      page?: number | 'all';
      size?: number;
      status?: string;
      userId?: string;
      from?: string;
      to?: string;
    } = {}
  ): Observable<IOrdersResponse> {

    const params: Record<string, string | number> = {};

    for (const key of Object.keys(filters)) {

      const value = (filters as Record<string, unknown>)[key];

      if (value !== undefined && value !== null && value !== '') {

        params[key] = value as string | number;

      }

    }

    return this._http.get<IOrdersResponse>(
      `${this.apiURL}/admin`,
      { params }
    );

  }


  getOrderByIdAdmin(orderId: string): Observable<IOrderResponse> {
    return this._http.get<IOrderResponse>(
      `${this.apiURL}/admin/${orderId}`
    );
  }


  updateOrderStatusAdmin(
    orderId: string,
    status: string
  ): Observable<IOrderResponse> {

    return this._http.patch<IOrderResponse>(
      `${this.apiURL}/admin/${orderId}/status`,
      { status }
    );

  }
}
