import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {

  resetForm: FormGroup;

  isLoading = false;

  errorMessage = '';

  showPassword = false;

  showConfirmPassword = false;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {

    this.resetForm = this._fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      otp: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]

    }, {
      validators: this.passwordsMatchValidator
    });

  }

  ngOnInit(): void {

    const email =
      this._route.snapshot.queryParamMap.get('email');

    if (email) {

      this.resetForm.patchValue({ email });

    }

  }

  private passwordsMatchValidator(group: FormGroup) {

    const password =
      group.get('password')?.value;

    const confirmPassword =
      group.get('confirmPassword')?.value;

    if (
      confirmPassword &&
      password !== confirmPassword
    ) {

      group.get('confirmPassword')
        ?.setErrors({ mismatch: true });

    }

    return null;

  }

  submit(): void {

    this.errorMessage = '';

    if (this.resetForm.invalid) {

      this.resetForm.markAllAsTouched();

      return;

    }

    this.isLoading = true;

    const {
      confirmPassword,
      ...payload
    } = this.resetForm.value;

    this._authService
      .resetPassword(payload)
      .subscribe({

        next: () => {

          this.isLoading = false;

          this._router.navigate(
            ['/login'],
            { queryParams: { reset: 1 } }
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

    this.errorMessage =
      err.error?.message ||
      'Something went wrong. Please try again.';

  }

  get email() {
    return this.resetForm.get('email');
  }

  get otp() {
    return this.resetForm.get('otp');
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

}
