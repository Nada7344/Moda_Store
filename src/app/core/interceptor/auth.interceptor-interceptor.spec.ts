import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const _tokenService = inject(TokenService);

  if (req.url.endsWith('/auth/refresh-token')) {

    return next(req);

  }

  const accessToken =
    _tokenService.getAccessToken();

  if (!accessToken) {

    return next(req);

  }

  const clonedRequest =
    req.clone({

      setHeaders: {

        Authorization:
          `Bearer ${accessToken}`

      }

    });

  return next(clonedRequest);

};
