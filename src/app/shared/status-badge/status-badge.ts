import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusBadgeType = 'order' | 'review';

@Component({
  selector: 'app-status-badge',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {

  @Input({ required: true }) status!: string;

  @Input() type: StatusBadgeType = 'order';

  get badgeClass(): string {

    if (this.type === 'review') {

      switch (this.status) {

        case 'Approved':
          return 'status-badge--approved';

        case 'Declined':
          return 'status-badge--declined';

        case 'Pending':
        case 'Unread':
          return 'status-badge--unread';

        default:
          return 'status-badge--unread';

      }

    }

    switch (this.status) {

      case 'Pending':
        return 'status-badge--pending';

      case 'In Progress':
        return 'status-badge--in-progress';

      case 'Shipped':
        return 'status-badge--shipped';

      case 'Delivered':
        return 'status-badge--delivered';

      case 'Cancelled by Customer':
      case 'Cancelled by Admin':
        return 'status-badge--cancelled';

      case 'Rejected':
        return 'status-badge--rejected';

      case 'Refunded':
        return 'status-badge--refunded';

      default:
        return 'status-badge--pending';

    }

  }

  get label(): string {

    if (
      this.status === 'Cancelled by Customer' ||
      this.status === 'Cancelled by Admin'
    ) {

      return 'Cancelled';

    }

    if (this.type === 'review' && this.status === 'Unread') {

      return 'Pending';

    }

    return this.status;

  }

}
