import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, tap, throwError } from 'rxjs';

import {
  IApiMessageRes,
  IForgotPasswordData,
  ILoginData,
  ILoginRes,
  IRegisterData,
  IRegisterRes,
  IResendOtpData,
  IResetPasswordData,
  ITokenPayload,
  IVerifyEmailData
} from '../models/auth.model';

import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _tokenService: TokenService
  ) {}

  private apiURL =
    environment.apiURL + '/auth';

  private userData =
    new BehaviorSubject<string | null>(null);

  private decodeToken(
    token: string
  ): ITokenPayload | null {

    try {

      const decode =
        jwtDecode<ITokenPayload>(token);

      const expDate =
        decode.exp * 1000;

      if (expDate > Date.now()) {

        return decode;

      }

      return null;

    } catch (err) {

      return null;

    }
  }

  checkIfLogin(): void {

    const token =
      this._tokenService.getAccessToken();

    if (!token) {

      this.userData.next(null);

      return;

    }

    const decode =
      this.decodeToken(token);

    if (decode) {

      this.userData.next(
        decode.sub
      );

    } else {
      this.userData.next(null);

    }

  }

  checkIfLoginWithRole(): string {

    const token =
      this._tokenService.getAccessToken();

    if (!token) {

      return '';

    }

    const decode =
      this.decodeToken(token);

    if (!decode) {

      return '';

    }

    return decode.aud?.[1] ?? '';

  }

  returnUserData() {

    return this.userData.asObservable();

  }

  refreshToken() {

    const refreshToken =
      this._tokenService.getRefreshToken();

    if (!refreshToken) {

      return throwError(
        () => new Error(
          'Refresh token not found'
        )
      );

    }

    return this._http
      .post<ILoginRes>(
        this.apiURL + '/refresh-token',
        {},
        {
          headers: {
            Authorization:
              `Bearer ${refreshToken}`
          }
        }
      )
      .pipe(

        tap((res) => {

          const newAccessToken =
            res.data.access_token;

          const newRefreshToken =
            res.data.refresh_token;

          this._tokenService.setTokens(
            newAccessToken,
            newRefreshToken
          );

          const decode =
            this.decodeToken(
              newAccessToken
            );

          if (decode) {

            this.userData.next(
              decode.sub
            );

          }

        })

      );

  }

  register(
    data: IRegisterData
  ) {

    return this._http
      .post<IRegisterRes>(
        this.apiURL + '/signup',
        data
      );

  }


  verifyEmail(
    data: IVerifyEmailData
  ) {

    return this._http
      .patch<IApiMessageRes>(
        this.apiURL + '/verify-email',
        data
      );

  }


  resendOtp(
    data: IResendOtpData
  ) {

    return this._http
      .patch<IApiMessageRes>(
        this.apiURL + '/resend-otp',
        data
      );

  }


  forgotPassword(
    data: IForgotPasswordData
  ) {

    return this._http
      .post<IApiMessageRes>(
        this.apiURL + '/forgot-password',
        data
      );

  }

  resetPassword(
    data: IResetPasswordData
  ) {

    return this._http
      .post<IApiMessageRes>(
        this.apiURL + '/reset-password',
        data
      );

  }



  login(
    data: ILoginData
  ) {

    return this._http
      .post<ILoginRes>(
        this.apiURL + '/login',
        data
      )
      .pipe(

        tap((res) => {

          const accessToken =
            res.data.access_token;

          const refreshToken =
            res.data.refresh_token;

          const decode =
            this.decodeToken(
              accessToken
            );

          if (!decode) {

            return;

          }

          this._tokenService.setTokens(
            accessToken,
            refreshToken
          );

          this.userData.next(
            decode.sub
          );

        })

      );

  }


  logout(): void {

    const refreshToken =
      this._tokenService.getRefreshToken();

    const clearLocalSession = () => {

      this._tokenService.removeTokens();

      this.userData.next(null);

      this._router.navigate(['/']);

    };

    this._http
      .post(
        this.apiURL + '/logout',
        {
          flag: 1,
          refresh_token: refreshToken
        }
      )
      .pipe(
        finalize(clearLocalSession)
      )
      .subscribe({
        error: () => {
        }
      });

  }

  returnToken(): string | null {

    return this._tokenService.getAccessToken();

  }

}
