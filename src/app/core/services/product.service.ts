import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IProductsRes, IProductRes, IProductFilters } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiURL = environment.apiURL + '/products';

  constructor(private _http: HttpClient) {}

  getAllProducts(filters?: IProductFilters) {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this._http.get<IProductsRes>(
      this.apiURL,
      { params }
    );
  }

  getNewArrivals(size?: number) {
    return this._http.get<IProductsRes>(
      this.apiURL + '/new-arrivals',
      {
        params: size ? { size } : {}
      }
    );
  }

  getTopSales(size?: number) {
    return this._http.get<IProductsRes>(
      this.apiURL + '/top-sales',
      {
        params: size ? { size } : {}
      }
    );
  }

  getProductBySlug(slug: string) {
    return this._http.get<IProductRes>(
      this.apiURL + `/${slug}`
    );
  }


  getAllProductsAdmin(filters?: IProductFilters & { isActive?: boolean; isDeleted?: boolean }) {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this._http.get<IProductsRes>(
      this.apiURL + '/admin',
      { params }
    );
  }

  getProductByIdAdmin(productId: string) {
    return this._http.get<IProductRes>(
      this.apiURL + `/admin/${productId}`
    );
  }

  createProduct(formData: FormData) {
    return this._http.post<IProductRes>(
      this.apiURL + '/admin',
      formData
    );
  }

  updateProduct(productId: string, formData: FormData) {
    return this._http.patch<IProductRes>(
      this.apiURL + `/admin/${productId}`,
      formData
    );
  }

  deleteProduct(productId: string) {
    return this._http.delete<IProductRes>(
      this.apiURL + `/admin/${productId}`
    );
  }

  updateStock(productId: string, stock: number) {
    return this._http.patch<IProductRes>(
      this.apiURL + `/admin/${productId}/stock`,
      { stock }
    );
  }

  updateStatus(productId: string, isActive: boolean) {
    return this._http.patch<IProductRes>(
      this.apiURL + `/admin/${productId}/status`,
      { isActive }
    );
  }

  updateFlags(productId: string, flags: { topSales?: boolean; newArrival?: boolean }) {
    return this._http.patch<IProductRes>(
      this.apiURL + `/admin/${productId}/flags`,
      { flags }
    );
  }
}
