import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './verify.html',
  styleUrl: './verify.css',
})
export class Verify implements OnInit, OnDestroy {

  verifyForm: FormGroup;

  email = '';

  isLoading = false;

  errorMessage = '';

  successMessage = '';

  resendCooldown = 0;

  private _cooldownHandle?: ReturnType<typeof setInterval>;

  digits: string[] = ['', '', '', '', '', ''];

  @ViewChildren('otpBox') private _otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {

    this.verifyForm = this._fb.group({

      otp: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/)
        ]
      ]

    });

  }

  ngOnInit(): void {

    this.email =
      this._route.snapshot.queryParamMap.get('email') || '';

    if (!this.email) {

      this._router.navigate(['/register']);

    }

  }

  ngOnDestroy(): void {

    if (this._cooldownHandle) {

      clearInterval(this._cooldownHandle);

    }

  }

  verify(): void {

    this.errorMessage = '';

    this.successMessage = '';

    if (this.verifyForm.invalid) {

      this.verifyForm.markAllAsTouched();

      return;

    }

    this.isLoading = true;

    this._authService
      .verifyEmail({
        email: this.email,
        otp: this.otp?.value
      })
      .subscribe({

        next: () => {

          this.isLoading = false;

          this._router.navigate(
            ['/login'],
            { queryParams: { verified: 1 } }
          );

        },

        error: (err) => {

          this.isLoading = false;

          this.handleError(err);

        }

      });

  }

  onDigitInput(index: number, event: Event): void {

    const input = event.target as HTMLInputElement;

    const value = input.value.replace(/\D/g, '').slice(-1);

    this.digits[index] = value;
    input.value = value;

    this._syncOtpControl();

    if (value && index < this.digits.length - 1) {

      this._focusBox(index + 1);

    }

  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {

    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {

      this._focusBox(index - 1);

    }

  }

  onDigitPaste(event: ClipboardEvent): void {

    const pasted =
      event.clipboardData?.getData('text').replace(/\D/g, '') || '';

    if (!pasted) {

      return;

    }

    event.preventDefault();

    const chars = pasted.slice(0, this.digits.length).split('');

    chars.forEach((char, i) => (this.digits[i] = char));

    this._syncOtpControl();

    this._focusBox(Math.min(chars.length, this.digits.length - 1));

  }

  private _syncOtpControl(): void {

    this.otp?.setValue(this.digits.join(''));

  }

  private _focusBox(index: number): void {

    const box = this._otpBoxes?.get(index);

    box?.nativeElement.focus();
    box?.nativeElement.select();

  }

  resendOtp(): void {

    if (this.resendCooldown > 0 || !this.email) {

      return;

    }

    this.errorMessage = '';

    this.successMessage = '';

    this._authService
      .resendOtp({ email: this.email })
      .subscribe({

        next: () => {

          this.successMessage =
            'A new code has been sent to your email.';

          this.startCooldown();

        },

        error: (err) => {

          this.handleError(err);

        }

      });

  }

  private startCooldown(): void {

    this.resendCooldown = 60;

    this._cooldownHandle = setInterval(() => {

      this.resendCooldown--;

      if (this.resendCooldown <= 0) {

        clearInterval(this._cooldownHandle);

      }

    }, 1000);

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

  get otp() {
    return this.verifyForm.get('otp');
  }

}
