import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IAddress, IAddressResponse, IUser, IUserResponse } from '../models/user.model';
import { IPasswordResponse } from '../models/auth.model';

export interface IUsersResponse {
  status: number;
  message: string;
  data: {
    docsCount: number;
    limit: number;
    pages: number;
    currentPage: number;
    result: IUser[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiURL =
    environment.apiURL + '/user';

  constructor(
    private _http: HttpClient
  ) {}

  getProfile(): Observable<IUserResponse> {

    return this._http.get<IUserResponse>(
      `${this.apiURL}/profile`
    );

  }

  updateProfile(
    data: {
      name?: string;
      gender?: string;
      phone?: string;
      DOB?: string;
    }
  ): Observable<IUserResponse> {

    return this._http.patch<IUserResponse>(
      `${this.apiURL}/profile`,
      data
    );

  }


  updatePassword(
    data: {
      oldPassword: string;
      password: string;
    }
  ): Observable<IPasswordResponse> {

    return this._http.patch<IPasswordResponse>(
      `${this.apiURL}/password`,
      data
    );

  }


  addAddress(
    address: Omit<IAddress, '_id'>
  ): Observable<IAddressResponse> {

    return this._http.post<IAddressResponse>(
      `${this.apiURL}/address`,
      address
    );

  }



  updateAddress(
    addressId: string,
    data: Partial<Omit<IAddress, '_id'>>
  ): Observable<IAddressResponse> {

    return this._http.patch<IAddressResponse>(
      `${this.apiURL}/address/${addressId}`,
      data
    );

  }



  deleteAddress(
    addressId: string
  ): Observable<IAddressResponse> {

    return this._http.delete<IAddressResponse>(
      `${this.apiURL}/address/${addressId}`
    );

  }


  getOrders() {

    return this._http.get(
      `${this.apiURL}/orders`
    );

  }



  getUsersAdmin(page: number | 'all' = 1, size = 10): Observable<IUsersResponse> {

    return this._http.get<IUsersResponse>(
      `${this.apiURL}/admin/users`,
      { params: { page, size } }
    );

  }


  getUserByIdAdmin(userId: string): Observable<IUserResponse> {

    return this._http.get<IUserResponse>(
      `${this.apiURL}/admin/users/${userId}`
    );

  }


  setUserBlockedStatus(userId: string, isBlocked: boolean): Observable<IUserResponse> {

    return this._http.patch<IUserResponse>(
      `${this.apiURL}/admin/users/${userId}/block`,
      { isBlocked }
    );

  }

}
