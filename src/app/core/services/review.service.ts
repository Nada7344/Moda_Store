import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

import {
  ICreateReview,
  IFeaturedReviewsRes,
  IReviewRes,
  IReviewsRes
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {

  private apiURL =
    environment.apiURL + '/reviews';

  constructor(
    private _http: HttpClient
  ) {}

  getProductReviews(
    productId: string,
    page: number = 1,
    size: number = 10
  ) {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this._http.get<IReviewsRes>(
      `${this.apiURL}/${productId}`,
      { params }
    );
  }


  getFeaturedReviews(limit: number = 6) {

    let params = new HttpParams()
      .set('limit', limit);

    return this._http.get<IFeaturedReviewsRes>(
      `${this.apiURL}/featured`,
      { params }
    );
  }


  createReview(data: ICreateReview) {

    return this._http.post<IReviewRes>(
      this.apiURL,
      data
    );
  }



  getReviewsAdmin(
    filters: {
      page?: number | 'all';
      size?: number;
      status?: string;
      productId?: string;
    } = {}
  ) {

    const params: Record<string, string | number> = {};

    for (const key of Object.keys(filters)) {

      const value = (filters as Record<string, unknown>)[key];

      if (value !== undefined && value !== null && value !== '') {

        params[key] = value as string | number;

      }

    }

    return this._http.get<IReviewsRes>(
      `${this.apiURL}/admin`,
      { params }
    );

  }


  updateReviewStatusAdmin(reviewId: string, status: 'Approved' | 'Declined') {

    return this._http.patch<IReviewRes>(
      `${this.apiURL}/admin/${reviewId}/status`,
      { status }
    );

  }

}
