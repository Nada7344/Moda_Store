import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,

  imports: [],

  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {

  @Input() title = 'Are you sure?';
  @Input() message = '';

  @Input() confirmLabel = 'Confirm';
  @Input() busyLabel = 'Working…';
  @Input() cancelLabel = 'Cancel';

  @Input() isBusy = false;
  @Input() errorMessage = '';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onCancel(): void {

    if (this.isBusy) {

      return;

    }

    this.cancelled.emit();

  }

  onConfirm(): void {

    if (this.isBusy) {

      return;

    }

    this.confirmed.emit();

  }

}
