import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { UserService } from '../../../core/services/user.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-password',
  standalone: true,

  imports: [
    ReactiveFormsModule,
  ],

  templateUrl: './password.html',
  styleUrl: './password.css',
})
export class Password {

  passwordForm: FormGroup;

  isSaving = false;

  errorMessage = '';
  successMessage = '';

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _tokenService: TokenService
  ) {

    this.passwordForm = this._fb.group({

      oldPassword: [
        '',
        [
          Validators.required,
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
          Validators.required,
        ]
      ]

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

  submit(): void {

    this.clearMessages();

    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      return;

    }

    const {
      oldPassword,
      password,
    } = this.passwordForm.value;

    this.isSaving = true;

    this._userService
      .updatePassword({
        oldPassword,
        password,
      })
      .subscribe({

        next: (response) => {

          this._tokenService.setTokens(
            response.data.accessToken,
            response.data.refreshToken
          );

          this.successMessage =
            'Your password has been updated successfully';

          this.isSaving = false;

          this.passwordForm.reset();

        },

        error: (error) => {

          console.error(
            'UPDATE PASSWORD ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update your password';

          this.isSaving = false;

        },

      });

  }

  private clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';

  }

  get oldPassword() {
    return this.passwordForm.get('oldPassword');
  }

  get password() {
    return this.passwordForm.get('password');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

}
