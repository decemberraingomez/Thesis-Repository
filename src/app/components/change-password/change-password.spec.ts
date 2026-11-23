/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../services/thesis.service';
import { ChangePassword } from './change-password';

interface ChangePasswordTestApi {
  form: FormGroup;
  submit: () => void;
}

const configure = (): void => {
  TestBed.configureTestingModule({
    imports: [ChangePassword],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
};

describe('ChangePassword', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configure();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('submits the current and new password to the API', () => {
    const fixture = TestBed.createComponent(ChangePassword);
    const http = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const api = fixture.componentInstance as unknown as ChangePasswordTestApi;
    api.form.setValue({
      currentPassword: 'TestAdminPass123!',
      newPassword: 'UpdatedAdmin2026!',
      confirmPassword: 'UpdatedAdmin2026!',
    });
    api.submit();

    const request = http.expectOne(`${API_BASE_URL}/auth/password`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      currentPassword: 'TestAdminPass123!',
      newPassword: 'UpdatedAdmin2026!',
    });

    request.flush({ message: 'Admin password updated successfully.' });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.alert--success')?.textContent).toContain(
      'Admin password updated successfully.'
    );
    http.verify();
  });

  it('blocks submission when the confirmation does not match', () => {
    const fixture = TestBed.createComponent(ChangePassword);
    const http = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const api = fixture.componentInstance as unknown as ChangePasswordTestApi;
    api.form.setValue({
      currentPassword: 'TestAdminPass123!',
      newPassword: 'UpdatedAdmin2026!',
      confirmPassword: 'DifferentAdmin2026!',
    });
    api.submit();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.alert--error')?.textContent).toContain(
      'New password and confirmation do not match.'
    );
    http.expectNone(`${API_BASE_URL}/auth/password`);
  });
});
