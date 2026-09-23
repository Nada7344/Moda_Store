import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
  catchError,
  throwError
} from 'rxjs';

import { Router } from '@angular/router';

import { TokenService } from '../services/token.service';

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const _router = inject(Router);
  const _tokenService = inject(TokenService);

  return next(req).pipe(

    catchError(
      (error: HttpErrorResponse) => {

        console.error(
          'HTTP Error:',
          error
        );

        if (error.status === 401) {

          _tokenService.removeTokens();

          _router.navigate(['/login']);

        }

        else if (error.status === 403) {

          console.error(
            'Forbidden: You do not have permission'
          );

        }

        else if (error.status === 404) {

          console.error(
            'Resource not found'
          );

        }

        else if (error.status >= 500) {

          console.error(
            'Server error. Please try again later.'
          );

        }

        else if (error.status === 0) {

          console.error(
            'Cannot connect to server'
          );

        }

        return throwError(
          () => error
        );

      }
    )

  );

};
