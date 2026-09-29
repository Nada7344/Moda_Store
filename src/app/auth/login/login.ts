import { Component, OnInit, signal } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Observable,
  catchError,
  finalize,
  of,
  tap
} from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import {
  ICartResponse,
  ISyncCartResponse
} from '../../core/models/cart.model';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-login',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  loginForm: FormGroup;

  isLoading = signal(false);

  errorMessage = signal('');

  successMessage = signal('');

  showPassword = false;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _cartService: CartService
  ) {

    this.loginForm = this._fb.group({

      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required]]

    });

  }

  ngOnInit(): void {

    const params = this._route.snapshot.queryParamMap;

    if (params.get('verified')) {

      this.successMessage.set('Email verified! You can now log in.');

    } else if (params.get('reset')) {

      this.successMessage.set(
        'Password reset! You can now log in with your new password.'
      );

    }

  }

  login(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }

    this.isLoading.set(true);

    this._authService
      .login(this.loginForm.value)
      .subscribe({

        next: () => this._loadCartThenRedirect(),

        error: (err) => {

          this.isLoading.set(false);

          this.errorMessage.set(getErrorMessage(err));

        }

      });

  }

 
  private _loadCartThenRedirect(): void {

    const syncRequest = this._cartService.syncGuestCart();

    const cart$: Observable<ICartResponse | ISyncCartResponse> =
      syncRequest
        ? syncRequest.pipe(
            tap(() => this._cartService.removeGuestCart()),
            catchError(() => this._cartService.getCart(true))
          )
        : this._cartService.getCart(true);

    cart$
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {

        if (res) {
          this._cartService.setCartCount(res.data.cart);
        }

        this._redirectAfterLogin();

      });

  }

  private _redirectAfterLogin(): void {

    const returnUrl =
      this._route.snapshot.queryParamMap.get('returnUrl');

    if (returnUrl) {

      this._router.navigateByUrl(returnUrl);

      return;

    }

    const role = this._authService.checkIfLoginWithRole();

    if (role === 'admin') {

      this._router.navigate(['/admin/dashboard']);

      return;

    }

    this._router.navigate(['/']);

  }

  get email() {

    return this.loginForm.get('email');

  }

  get password() {

    return this.loginForm.get('password');

  }

}
