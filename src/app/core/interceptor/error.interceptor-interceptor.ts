import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenService } from '../services/token.service';

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const _router = inject(Router);
  const _tokenService = inject(TokenService);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      console.error('HTTP Error:', error);

      if (
        error.status === 401 &&
        !req.url.endsWith('/auth/refresh-token')
      ) {

        _tokenService.removeTokens();

        if (!_router.url.startsWith('/login')) {
          _router.navigate(['/login']);
        }

      }

      return throwError(() => error);

    })

  );

};
