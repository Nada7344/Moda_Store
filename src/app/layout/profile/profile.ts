import {
  CommonModule,
} from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
  ],

  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  user: IUser | null = null;

  loading = true;
  errorMessage = '';

  constructor(
    private _authService: AuthService,
    private _userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {

    this.loading = true;

    this._userService.getProfile().subscribe({

      next: (response) => {

        this.user = response.data.user;

        this.loading = false;

        this._cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'PROFILE ERROR:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to load your profile';

        this.loading = false;

        this._cdr.detectChanges();
      },

    });
  }

  logout(): void {
    this._authService.logout();
  }
}
