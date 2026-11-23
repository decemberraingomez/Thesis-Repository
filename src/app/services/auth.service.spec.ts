/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthUser, LoginResponse } from '../models/auth.model';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  AuthService,
} from './auth.service';
import { API_BASE_URL } from './thesis.service';

const adminUser: AuthUser = {
  id: '65f1d1f1f1f1f1f1f1f1f1f1f',
  name: 'Library Administrator',
  email: 'admin@ubaguio.edu',
  role: 'admin',
};

const buildToken = (expiresInSeconds = 3600): string => {
  const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = btoa(JSON.stringify({ exp: expiration }));
  return `${payload}.test-signature`;
};

const configure = (): void => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
};

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configure();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('logs in the admin, exposes the admin role, and persists the session', () => {
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const response: LoginResponse = { token: 'signed-admin-token', user: adminUser };

    expect(service.isAdmin()).toBe(false);
    expect(service.role()).toBe('public');

    service.login('admin@ubaguio.edu', 'TestAdminPass123!').subscribe();

    const request = http.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'admin@ubaguio.edu',
      password: 'TestAdminPass123!',
    });

    request.flush(response);

    expect(service.isAdmin()).toBe(true);
    expect(service.role()).toBe('admin');
    expect(service.currentUser()).toEqual(adminUser);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('signed-admin-token');
    expect(localStorage.getItem(AUTH_USER_STORAGE_KEY)).toBe(JSON.stringify(adminUser));
    http.verify();
  });

  it('restores a persisted non-expired admin session on refresh', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, buildToken());
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(adminUser));

    const service = TestBed.inject(AuthService);

    expect(service.isAdmin()).toBe(true);
    expect(service.currentUser()).toEqual(adminUser);
  });

  it('clears expired sessions and hashes no stale admin state', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, buildToken(-60));
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(adminUser));

    const service = TestBed.inject(AuthService);

    expect(service.isAdmin()).toBe(false);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_STORAGE_KEY)).toBeNull();
  });

  it('logs out, clears storage, and redirects to the login page', () => {
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.login('admin@ubaguio.edu', 'TestAdminPass123!').subscribe();
    http
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush({ token: 'signed-admin-token', user: adminUser } satisfies LoginResponse);

    service.logout();

    expect(service.isAdmin()).toBe(false);
    expect(service.token()).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    http.verify();
  });

  it('sends a password change request to the admin API', () => {
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);

    service.changePassword('TestAdminPass123!', 'UpdatedAdmin2026!').subscribe();

    const request = http.expectOne(`${API_BASE_URL}/auth/password`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      currentPassword: 'TestAdminPass123!',
      newPassword: 'UpdatedAdmin2026!',
    });

    request.flush({ message: 'Admin password updated successfully.' });
    http.verify();
  });

  it('clears a stale token and publishes a notice after an auth failure', () => {
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.login('admin@ubaguio.edu', 'TestAdminPass123!').subscribe();
    http
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush({ token: 'signed-admin-token', user: adminUser } satisfies LoginResponse);

    service.notifyAuthFailure(401);

    expect(service.isAdmin()).toBe(false);
    expect(service.sessionNotice()).toContain('session has expired');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    http.verify();
  });
});
