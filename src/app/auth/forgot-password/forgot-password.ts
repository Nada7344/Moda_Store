import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  forgotForm: FormGroup;

  isLoading = false;

  errorMessage = '';

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {

    this.forgotForm = this._fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });

  }

  submit(): void {

    this.errorMessage = '';

    if (this.forgotForm.invalid) {

      this.forgotForm.markAllAsTouched();

      return;

    }

    this.isLoading = true;

    const email =
      this.email?.value;

    this._authService
      .forgotPassword({ email })
      .subscribe({

        next: () => {

          this.isLoading = false;

          this._router.navigate(
            ['/reset-password'],
            { queryParams: { email } }
          );

        },

        error: (err) => {

          this.isLoading = false;

          this.handleError(err);

        }

      });

  }

  private handleError(err: any): void {

    if (err.status === 0) {

      this.errorMessage =
        'Unable to connect to the server. Please try again.';

      return;

    }

    if (err.status === 404) {

      this.errorMessage =
        err.error?.message ||
        'No account found with this email.';

      return;

    }

    this.errorMessage =
      err.error?.message ||
      'Something went wrong. Please try again.';

  }

  get email() {
    return this.forgotForm.get('email');
  }

}
