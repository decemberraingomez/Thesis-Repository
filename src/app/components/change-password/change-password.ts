/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly open = input<boolean>(false);
  readonly closed = output<void>();

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    currentPassword: this.formBuilder.nonNullable.control('', [Validators.required]),
    newPassword: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(MIN_PASSWORD_LENGTH),
    ]),
    confirmPassword: this.formBuilder.nonNullable.control('', [Validators.required]),
  });

  protected showError(control: AbstractControl, error: string): boolean {
    return (control.touched || control.dirty) && control.hasError(error);
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set(
        `Enter your current password and a new password of at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New password and confirmation do not match.');
      return;
    }

    this.submitting.set(true);

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Admin password updated successfully.');
        this.form.reset();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.describeError(error));
      },
    });
  }

  protected close(): void {
    if (this.submitting()) {
      return;
    }

    this.form.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = (error.error as { message?: unknown } | null)?.message;

      if (typeof message === 'string') {
        return message;
      }

      if (error.status === 401) {
        return 'Current password is incorrect.';
      }

      return `The server returned an unexpected error (HTTP ${error.status}).`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
