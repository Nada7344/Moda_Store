import {

  CommonModule,
} from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { UserService } from '../../../core/services/user.service';
import { IUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class PersonalInfo implements OnInit {

  user: IUser | null = null;

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  form = {

    name: '',

    email: '',

    phone: '',

    DOB: '',

    gender: '',

  };

  constructor(
    private _userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {

    this.isLoading = true;

    this.clearMessages();

    this._cdr.detectChanges();

    this._userService
      .getProfile()
      .subscribe({

        next: (response) => {

          this.user =
            response.data.user;

          this.form = {

            name:
              this.user.name ?? '',

            email:
              this.user.email ?? '',

            phone:
              this.user.phone ?? '',

            DOB:
              this.formatDateForInput(
                this.user.DOB
              ),

            gender:
              this.user.gender ?? '',

          };

          this.isLoading = false;

          this._cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'LOAD PROFILE ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load profile';

          this.isLoading = false;

          this._cdr.detectChanges();
        },

      });
  }

  saveChanges(): void {

    this.clearMessages();

    if (!this.form.name.trim()) {

      this.errorMessage =
        'Name is required';

      this._cdr.detectChanges();

      return;
    }

    const payload: {
      name?: string;
      gender?: string;
      phone?: string;
      DOB?: string;
    } = {

      name:
        this.form.name.trim(),

    };

    if (this.form.gender) {

      payload.gender =
        this.form.gender;
    }

    if (this.form.phone.trim()) {

      payload.phone =
        this.form.phone.trim();
    }

    if (this.form.DOB) {

      payload.DOB =
        this.form.DOB;
    }

    this.isSaving = true;

    this._cdr.detectChanges();

    this._userService
      .updateProfile(payload)
      .subscribe({

        next: (response) => {

          this.user =
            response.data.user;

          this.form.name =
            this.user.name ?? '';

          this.form.email =
            this.user.email ?? '';

          this.form.phone =
            this.user.phone ?? '';

          this.form.DOB =
            this.formatDateForInput(
              this.user.DOB
            );

          this.form.gender =
            this.user.gender ?? '';

          this.successMessage =
            'Personal information updated successfully';

          this.isSaving = false;

          this._cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'UPDATE PROFILE ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update profile';

          this.isSaving = false;

          this._cdr.detectChanges();
        },

      });
  }

  private formatDateForInput(
    date?: string
  ): string {

    if (!date) {
      return '';
    }

    return date.split('T')[0];
  }

  private clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';
  }
}
