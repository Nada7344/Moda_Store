import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
})
export class AdminTopbar {

  @Input() admin: IUser | null = null;

  searchTerm = '';

  get initials(): string {

    if (!this.admin?.name) {

      return 'A';

    }

    return this.admin.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');

  }

}
