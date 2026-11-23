/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    remember: this.formBuilder.nonNullable.control(true),
  });

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      void this.router.navigate(['/theses']);
    }
  }

  protected showError(control: AbstractControl, error: string): boolean {
    return (control.touched || control.dirty) && control.hasError(error);
  }

  protected onSubmit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Enter a valid admin email and password.');
      return;
    }

    const { email, password, remember } = this.form.getRawValue();
    this.submitting.set(true);

    this.authService.login(email, password, remember).subscribe({
      next: () => {
        this.submitting.set(false);
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        const destination = redirectTo?.startsWith('/') ? redirectTo : '/theses';
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.authService.describeLoginError(error));
      },
    });
  }
}
