import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (
  route,
  state
) => {

  const _authService = inject(AuthService);
  const _router = inject(Router);

  
  return _authService.ensureSession().pipe(

    map((isLoggedIn) => {

      if (!isLoggedIn) {

        return _router.createUrlTree(
          ['/login'],
          { queryParams: { returnUrl: state.url } }
        );

      }

      if (_authService.checkIfLoginWithRole() === 'admin') {

        return true;

      }

      return _router.createUrlTree(['/home']);

    })

  );

};
