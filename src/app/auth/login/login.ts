import { Component, OnInit } from '@angular/core';

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

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

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

  isLoading = false;

  errorMessage = '';

  successMessage = '';

  showPassword = false;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _cartService: CartService
  ) {

    this.loginForm = this._fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ]

    });

  }

  ngOnInit(): void {

    const params =
      this._route.snapshot.queryParamMap;

    if (params.get('verified')) {

      this.successMessage =
        'Email verified! You can now log in.';

    } else if (params.get('reset')) {

      this.successMessage =
        'Password reset! You can now log in with your new password.';

    }

  }

  login(): void {

    this.errorMessage = '';

    this.successMessage = '';

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }

    this.isLoading = true;

    this._authService
      .login(this.loginForm.value)
      .subscribe({

        next: (res) => {

          const syncRequest =
            this._cartService.syncGuestCart();

          if (!syncRequest) {

            this._cartService
              .getCart(true)
              .subscribe({

                next: (cartResponse) => {

                  this._cartService
                    .setCartCount(
                      cartResponse.data.cart
                    );

                  this.isLoading = false;

                  this._redirectAfterLogin();

                },

                error: (error) => {

                  console.error(
                    'GET USER CART ERROR:',
                    error
                  );

                  this.isLoading = false;

                  this._redirectAfterLogin();

                }

              });

            return;

          }

          syncRequest.subscribe({

            next: (syncResponse) => {

              console.log(
                'CART SYNC SUCCESS:',
                syncResponse
              );

              this._cartService
                .removeGuestCart();

              this._cartService
                .setCartCount(
                  syncResponse.data.cart
                );

              this.isLoading = false;

              this._redirectAfterLogin();

            },

            error: (error) => {

              console.error(
                'CART SYNC ERROR:',
                error
              );

              this._cartService
                .getCart(true)
                .subscribe({

                  next: (cartResponse) => {

                    this._cartService
                      .setCartCount(
                        cartResponse.data.cart
                      );

                    this.isLoading = false;

                    this._redirectAfterLogin();

                  },

                  error: (cartError) => {

                    console.error(
                      'GET USER CART ERROR:',
                      cartError
                    );

                    this.isLoading = false;

                    this._redirectAfterLogin();

                  }

                });

            }

          });

        },

        error: (err) => {

          console.error(
            'LOGIN ERROR:',
            err
          );

          this.isLoading = false;

          this.handleLoginError(err);

        }

      });

  }

  private _redirectAfterLogin(): void {

    const returnUrl =
      this._route.snapshot.queryParamMap.get('returnUrl');

    if (returnUrl) {

      this._router.navigateByUrl(returnUrl);

      return;

    }

    const role =
      this._authService.checkIfLoginWithRole();

    if (role === 'admin') {

      this._router.navigate(['/admin/dashboard']);

      return;

    }

    this._router.navigate(['/']);

  }

  private handleLoginError(
    err: any
  ): void {

    if (err.status === 0) {

      this.errorMessage =
        'Unable to connect to the server. Please try again.';

      return;

    }

    if (err.status === 401) {

      this.errorMessage =
        err.error?.message ||
        'Invalid email or password.';

      return;

    }

    if (err.status === 403) {

      this.errorMessage =
        err.error?.message ||
        'You are not allowed to login.';

      return;

    }

    this.errorMessage =
      err.error?.message ||
      'Something went wrong. Please try again.';

  }

  get email() {

    return this.loginForm.get('email');

  }

  get password() {

    return this.loginForm.get('password');

  }

}
