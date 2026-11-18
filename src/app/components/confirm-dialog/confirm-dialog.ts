/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository
 */

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly open = input<boolean>(false);
  readonly title = input<string>('Confirm deletion');
  readonly message = input<string>('This action cannot be undone.');
  readonly confirmLabel = input<string>('Delete');
  readonly cancelLabel = input<string>('Cancel');
  readonly busy = input<boolean>(false);
  readonly maxWidth = input<number>(440);
  readonly variant = input<'danger' | 'primary'>('danger');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected confirm(): void {
    if (!this.busy()) {
      this.confirmed.emit();
    }
  }

  protected cancel(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
