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
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  registerForm: FormGroup;

  isLoading = false;

  errorMessage = '';

  showPassword = false;

  showConfirmPassword = false;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {

    this.registerForm = this._fb.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

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
      ],

      phone: [
        '',
        [
          Validators.pattern(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)
        ]
      ],

      gender: [''],

      DOB: ['']

    }, {
      validators: this.passwordsMatchValidator
    });

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

  register(): void {

    this.errorMessage = '';

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      return;

    }

    this.isLoading = true;

    const {
      confirmPassword,
      ...formValue
    } = this.registerForm.value;

    const payload = Object.fromEntries(
      Object.entries(formValue).filter(
        ([, value]) => value !== '' && value !== null
      )
    );

    this._authService
      .register(payload as any)
      .subscribe({

        next: (res) => {

          this.isLoading = false;

          this._router.navigate(
            ['/verify'],
            { queryParams: { email: this.email?.value } }
          );

        },

        error: (err) => {

          this.isLoading = false;

          this.handleRegisterError(err);

        }

      });

  }

  private handleRegisterError(err: any): void {

    if (err.status === 0) {

      this.errorMessage =
        'Unable to connect to the server. Please try again.';

      return;

    }

    if (err.status === 409) {

      this.errorMessage =
        err.error?.message ||
        'This email is already registered.';

      return;

    }

    this.errorMessage =
      err.error?.message ||
      'Something went wrong. Please try again.';

  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

}
