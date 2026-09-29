import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,

  imports: [],

  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {

  // NOTE: named `heading` (not `title`) so Angular doesn't also render a native
  // HTML title attribute on the host element (that showed as a stray tooltip box).
  @Input() heading = 'Are you sure?';
  @Input() message = '';

  @Input() confirmLabel = 'Confirm';
  @Input() busyLabel = 'Working…';
  @Input() cancelLabel = 'Cancel';

  @Input() isBusy = false;
  @Input() confirmDisabled = false;
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

    if (this.isBusy || this.confirmDisabled) {

      return;

    }

    this.confirmed.emit();

  }

}
