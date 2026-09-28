import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

let isRefreshing = false;

let refreshTokenSubject =
  new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const _authService = inject(AuthService);
  const _tokenService = inject(TokenService);

  if (req.url.endsWith('/auth/refresh-token')) {
    return next(req);
  }

  const accessToken = _tokenService.getAccessToken();

  if (!accessToken) {
    return next(req);
  }

  const withToken = (token: string) =>
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

  return next(withToken(accessToken)).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {

        return refreshTokenSubject.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((newToken) => next(withToken(newToken)))
        );

      }

      isRefreshing = true;
      refreshTokenSubject.next(null);

      return _authService.refreshToken().pipe(


        catchError(() => {

          _tokenService.removeTokens();

          refreshTokenSubject.error(error);
          refreshTokenSubject =
            new BehaviorSubject<string | null>(null);

          return throwError(() => error);

        }),

        switchMap(() => {

          const newToken = _tokenService.getAccessToken();

          if (!newToken) {
            return throwError(() => error);
          }

          refreshTokenSubject.next(newToken);

          return next(withToken(newToken));

        }),

        finalize(() => {
          isRefreshing = false;
        })

      );

    })

  );

};
