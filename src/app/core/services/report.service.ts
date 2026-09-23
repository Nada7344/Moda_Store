import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  IReportDateRange,
  IReportOverviewRes,
  INewUsersReportRes,
  ISalesReportRes,
  ITopProductsRes,
  ReportGroupBy,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {

  private readonly apiURL = environment.apiURL + '/reports';

  constructor(private _http: HttpClient) {}

  getOverview(range: IReportDateRange = {}): Observable<IReportOverviewRes> {

    return this._http.get<IReportOverviewRes>(
      `${this.apiURL}/overview`,
      { params: this._buildParams(range) }
    );

  }


  getSales(
    range: IReportDateRange = {},
    groupBy: ReportGroupBy = 'week'
  ): Observable<ISalesReportRes> {

    return this._http.get<ISalesReportRes>(
      `${this.apiURL}/sales`,
      { params: this._buildParams(range, { groupBy }) }
    );

  }


  getTopProducts(
    range: IReportDateRange = {},
    limit = 4
  ): Observable<ITopProductsRes> {

    return this._http.get<ITopProductsRes>(
      `${this.apiURL}/top-products`,
      { params: this._buildParams(range, { limit }) }
    );

  }



  getNewUsers(
    range: IReportDateRange = {},
    groupBy: ReportGroupBy = 'day'
  ): Observable<INewUsersReportRes> {

    return this._http.get<INewUsersReportRes>(
      `${this.apiURL}/new-users`,
      { params: this._buildParams(range, { groupBy }) }
    );

  }

  private _buildParams(
    range: IReportDateRange,
    extra: Record<string, string | number | undefined> = {}
  ): Record<string, string | number> {

    const params: Record<string, string | number> = {};

    const merged = { ...range, ...extra };

    for (const key of Object.keys(merged)) {

      const value = (merged as Record<string, string | number | undefined>)[key];

      if (value !== undefined && value !== null && value !== '') {

        params[key] = value;

      }

    }

    return params;

  }

}
