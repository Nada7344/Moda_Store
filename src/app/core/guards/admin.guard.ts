import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (
  route,
  state
) => {

  const _tokenService = inject(TokenService);
  const _authService = inject(AuthService);
  const _router = inject(Router);

  if (!_tokenService.isLoggedIn()) {

    return _router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          returnUrl: state.url
        }
      }
    );

  }

  const role =
    _authService.checkIfLoginWithRole();

  if (role === 'admin') {

    return true;

  }

  return _router.createUrlTree(['/home']);

};
