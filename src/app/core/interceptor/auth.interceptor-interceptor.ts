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

  const accessToken =
    _tokenService.getAccessToken();

  if (!accessToken) {

    return next(req);

  }

  const authRequest =
    req.clone({

      setHeaders: {

        Authorization:
          `Bearer ${accessToken}`

      }

    });

  return next(authRequest).pipe(

    catchError((error: HttpErrorResponse) => {

    

      if (error.status !== 401) {

        return throwError(
          () => error
        );

      }



      if (isRefreshing) {

        return refreshTokenSubject.pipe(

          filter(
            (token): token is string =>
              token !== null
          ),

          take(1),

          switchMap((newAccessToken) => {

            const retryRequest =
              req.clone({

                setHeaders: {

                  Authorization:
                    `Bearer ${newAccessToken}`

                }

              });

            return next(retryRequest);

          })

        );

      }


      isRefreshing = true;

      refreshTokenSubject.next(null);

      return _authService.refreshToken().pipe(

        switchMap(() => {

          const newAccessToken =
            _tokenService.getAccessToken();

          if (!newAccessToken) {

            return throwError(
              () =>
                new Error(
                  'New access token not found'
                )
            );

          }


          refreshTokenSubject.next(
            newAccessToken
          );


          const retryRequest =
            req.clone({

              setHeaders: {

                Authorization:
                  `Bearer ${newAccessToken}`

              }

            });

          return next(retryRequest);

        }),

        catchError((refreshError) => {

          _tokenService.removeTokens();

          refreshTokenSubject.error(refreshError);
          refreshTokenSubject =
            new BehaviorSubject<string | null>(null);

          return throwError(
            () => refreshError
          );

        }),


        finalize(() => {

          isRefreshing = false;

        })

      );

    })

  );

};
