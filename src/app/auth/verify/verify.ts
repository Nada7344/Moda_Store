import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  signal
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage } from '../../core/utils/http-error';

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

  isLoading = signal(false);

  isResending = signal(false);

  errorMessage = signal('');

  successMessage = signal('');

  resendCooldown = signal(0);

  emailSentMessage = signal(true);

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
    this.email = this._route.snapshot.queryParamMap.get('email') || '';

    if (!this.email) {
      this._router.navigate(['/register']);
      return;
    }

    this.emailSentMessage.set(true);
  }

  ngOnDestroy(): void {

    clearInterval(this._cooldownHandle);

  }

  verify(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.verifyForm.invalid) {

      this.verifyForm.markAllAsTouched();

      return;

    }

    this.isLoading.set(true);

    this._authService
      .verifyEmail({
        email: this.email,
        otp: this.otp?.value
      })
      .subscribe({

        next: () => {

          this.isLoading.set(false);

          this._router.navigate(
            ['/login'],
            { queryParams: { verified: 1 } }
          );

        },

        error: (err) => {

          this.isLoading.set(false);

          this.errorMessage.set(getErrorMessage(err));

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

    if (this.resendCooldown() > 0 || this.isResending() || !this.email) {

      return;

    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.isResending.set(true);

    this._authService
      .resendOtp({ email: this.email })
      .subscribe({

        next: () => {

          this.isResending.set(false);

          this.successMessage.set('New code sent! Please check your inbox or Spam/Junk folder.' );

          this.startCooldown();

        },

        error: (err) => {

          this.isResending.set(false);

          this.errorMessage.set(getErrorMessage(err));

        }

      });

  }

  private startCooldown(): void {

    clearInterval(this._cooldownHandle);

    this.resendCooldown.set(60);

    this._cooldownHandle = setInterval(() => {

      this.resendCooldown.update((value) => value - 1);

      if (this.resendCooldown() <= 0) {

        clearInterval(this._cooldownHandle);

      }

    }, 1000);

  }

  get otp() {
    return this.verifyForm.get('otp');
  }

}
