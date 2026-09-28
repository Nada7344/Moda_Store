import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage } from '../../core/utils/http-error';

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

  isLoading = signal(false);

  errorMessage = signal('');

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {

    this.forgotForm = this._fb.group({

      email: ['', [Validators.required, Validators.email]]

    });

  }

  submit(): void {

    this.errorMessage.set('');

    if (this.forgotForm.invalid) {

      this.forgotForm.markAllAsTouched();

      return;

    }

    this.isLoading.set(true);

    const email = this.email?.value;

    this._authService
      .forgotPassword({ email })
      .subscribe({

        next: () => {

          this.isLoading.set(false);

          this._router.navigate(
            ['/reset-password'],
            { queryParams: { email } }
          );

        },

        error: (err) => {

          this.isLoading.set(false);

          this.errorMessage.set(
            err?.status === 404
              ? 'No account found with this email.'
              : getErrorMessage(err)
          );

        }

      });

  }

  get email() {
    return this.forgotForm.get('email');
  }

}
