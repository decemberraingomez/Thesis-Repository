/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthUser, LoginResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../services/thesis.service';
import { authInterceptor } from './auth.interceptor';

const adminUser: AuthUser = {
  id: '65f1d1f1f1f1f1f1f1f1f1f1f',
  name: 'Library Administrator',
  email: 'admin@ubaguio.edu',
  role: 'admin',
};

const configure = (): void => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      provideRouter([]),
    ],
  });
};

const loginAdmin = (http: HttpTestingController, authService: AuthService): void => {
  authService.login('admin@ubaguio.edu', 'TestAdminPass123!').subscribe();
  http
    .expectOne(`${API_BASE_URL}/auth/login`)
    .flush({ token: 'signed-admin-token', user: adminUser } satisfies LoginResponse);
};

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configure();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('attaches the bearer token to authenticated API requests', () => {
    const http = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);
    const client = TestBed.inject(HttpClient);

    loginAdmin(http, authService);

    client.get(`${API_BASE_URL}/theses`).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/theses`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer signed-admin-token');
    request.flush([]);
    http.verify();
  });

  it('clears stale admin state when the API returns 401', () => {
    const http = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);
    const client = TestBed.inject(HttpClient);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    loginAdmin(http, authService);

    client.get(`${API_BASE_URL}/theses`).subscribe({ error: () => undefined });

    http
      .expectOne(`${API_BASE_URL}/theses`)
      .flush({ message: 'Authentication required. Admin login needed.' }, {
        status: 401,
        statusText: 'Unauthorized',
      });

    expect(authService.isAdmin()).toBe(false);
    expect(authService.sessionNotice()).toContain('session has expired');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    http.verify();
  });

  it('keeps the admin session when only the current password is wrong', () => {
    const http = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);
    const client = TestBed.inject(HttpClient);

    loginAdmin(http, authService);

    client
      .put(`${API_BASE_URL}/auth/password`, {
        currentPassword: 'WrongPass2026!',
        newPassword: 'UpdatedAdmin2026!',
      })
      .subscribe({ error: () => undefined });

    http
      .expectOne(`${API_BASE_URL}/auth/password`)
      .flush(
        {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect.',
        },
        { status: 401, statusText: 'Unauthorized' }
      );

    expect(authService.isAdmin()).toBe(true);
    expect(authService.sessionNotice()).toBe('');
    http.verify();
  });
});
