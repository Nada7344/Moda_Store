import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../core/services/user.service';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {

  constructor(
    private _userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {}

  users: IUser[] = [];

  isLoading = true;
  errorMessage = '';

  searchTerm = '';
  statusFilter: '' | 'active' | 'blocked' = '';

  page = 1;
  size = 10;
  pages = 1;
  docsCount = 0;

  private _busyIds = new Set<string>();

  userForDetails: IUser | null = null;
  isLoadingDetails = false;

  ngOnInit(): void {

    this.loadUsers();

  }

  loadUsers(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._userService.getUsersAdmin(this.page, this.size).subscribe({

      next: response => {

        this.users = response.data.result || [];
        this.pages = response.data.pages || 1;
        this.docsCount = response.data.docsCount || 0;
        this.page = response.data.currentPage || this.page;

        this.isLoading = false;

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN USERS — LOAD ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load users right now.';

        this.isLoading = false;

        this._cdr.detectChanges();

      }

    });

  }

  get visibleUsers(): IUser[] {

    const term = this.searchTerm.trim().toLowerCase();

    return this.users.filter(user => {

      const matchesTerm =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesStatus =
        !this.statusFilter ||
        (this.statusFilter === 'blocked' ? !!user.isBlocked : !user.isBlocked);

      return matchesTerm && matchesStatus;

    });

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.pages || page === this.page) {

      return;

    }

    this.page = page;

    this.loadUsers();

  }

  get pageNumbers(): number[] {

    return Array.from({ length: this.pages }, (_, index) => index + 1);

  }

  get rangeStart(): number {

    return this.docsCount === 0 ? 0 : (this.page - 1) * this.size + 1;

  }

  get rangeEnd(): number {

    return Math.min(this.page * this.size, this.docsCount);

  }

  isBusy(userId: string): boolean {

    return this._busyIds.has(userId);

  }

  toggleBlocked(user: IUser): void {

    if (this.isBusy(user._id)) {

      return;

    }

    const nextBlocked = !user.isBlocked;

    this._busyIds.add(user._id);

    this._userService.setUserBlockedStatus(user._id, nextBlocked).subscribe({

      next: response => {

        user.isBlocked = response.data.user.isBlocked;

        this._busyIds.delete(user._id);

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN USERS — BLOCK TOGGLE ERROR:', error);

        this._busyIds.delete(user._id);

        this._cdr.detectChanges();

        alert(error?.error?.message || 'Unable to update this user right now.');

      }

    });

  }

  openDetails(user: IUser): void {

    this.userForDetails = user;
    this.isLoadingDetails = true;

    this._userService.getUserByIdAdmin(user._id).subscribe({

      next: response => {

        this.userForDetails = response.data.user;
        this.isLoadingDetails = false;

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN USERS — LOAD DETAILS ERROR:', error);

        this.isLoadingDetails = false;

        this._cdr.detectChanges();

      }

    });

  }

  closeDetails(): void {

    this.userForDetails = null;

  }

  initials(user: IUser): string {

    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'U';

  }

  ordersCount(user: IUser): number {

    return user.ordersHistory?.length || 0;

  }

}
