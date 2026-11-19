/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 *
 * Role permission matrix (frontend source of truth):
 * - public: read/browse/search thesis records, view details, use citation lookup.
 * - admin: all public permissions plus create, update, delete, and session control.
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginRequest, LoginResponse, UserRole } from '../models/auth.model';
import { API_BASE_URL } from './thesis.service';

export const AUTH_TOKEN_STORAGE_KEY = 'thesis-repo.auth.token';
export const AUTH_USER_STORAGE_KEY = 'thesis-repo.auth.user';

type AuthStorage = Storage;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly noticeState = signal('');

  readonly currentUser = this.userState.asReadonly();
  readonly token = this.tokenState.asReadonly();
  readonly sessionNotice = this.noticeState.asReadonly();
  readonly isAdmin = computed(() => this.userState()?.role === 'admin');
  readonly role = computed<UserRole>(() => this.userState()?.role ?? 'public');
  readonly isAuthenticated = computed(() => this.tokenState() !== null && this.isAdmin());

  constructor() {
    this.restoreSession();
  }

  login(email: string, password: string, remember = true): Observable<LoginResponse> {
    const payload: LoginRequest = { email: email.trim(), password };

    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload).pipe(
      tap((response) => {
        this.persistSession(response, remember);
        this.noticeState.set('');
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.noticeState.set('');
    void this.router.navigate(['/login']);
  }

  notifyAuthFailure(status: number): void {
    if (!this.isAuthenticated()) {
      return;
    }

    this.clearSession();
    this.noticeState.set(
      status === 403
        ? 'Your account does not have permission to perform that action. Please sign in as an administrator.'
        : 'Your admin session has expired. Please sign in again.'
    );
  }

  dismissNotice(): void {
    this.noticeState.set('');
  }

  describeLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Invalid admin email or password.';
      }

      if (error.status === 0) {
        return 'Cannot reach the authentication API. Make sure the Express server is running on port 3000.';
      }

      return `The server returned an unexpected error (HTTP ${error.status}).`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private persistSession(response: LoginResponse, remember: boolean): void {
    this.tokenState.set(response.token);
    this.userState.set(response.user);

    const storage = remember ? this.getLocalStorage() : this.getSessionStorage();
    const staleStorage = remember ? this.getSessionStorage() : this.getLocalStorage();

    this.removeFromStorage(staleStorage);

    if (!storage) {
      return;
    }

    try {
      storage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
      storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(response.user));
    } catch {
      this.tokenState.set(response.token);
      this.userState.set(response.user);
    }
  }

  private restoreSession(): void {
    const token =
      this.readFromStorage(this.getLocalStorage(), AUTH_TOKEN_STORAGE_KEY) ??
      this.readFromStorage(this.getSessionStorage(), AUTH_TOKEN_STORAGE_KEY);
    const userJson =
      this.readFromStorage(this.getLocalStorage(), AUTH_USER_STORAGE_KEY) ??
      this.readFromStorage(this.getSessionStorage(), AUTH_USER_STORAGE_KEY);

    if (!token || !userJson) {
      this.clearStoredSession();
      return;
    }

    if (this.isTokenExpired(token)) {
      this.clearStoredSession();
      return;
    }

    const user = this.parseUser(userJson);

    if (!user) {
      this.clearStoredSession();
      return;
    }

    this.tokenState.set(token);
    this.userState.set(user);
  }

  private clearSession(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    this.clearStoredSession();
  }

  private clearStoredSession(): void {
    this.removeFromStorage(this.getLocalStorage());
    this.removeFromStorage(this.getSessionStorage());
  }

  private parseUser(value: string): AuthUser | null {
    try {
      const candidate = JSON.parse(value) as Record<string, unknown>;
      const role = candidate['role'];

      if (
        typeof candidate['name'] !== 'string' ||
        typeof candidate['email'] !== 'string' ||
        (role !== 'public' && role !== 'admin')
      ) {
        return null;
      }

      return {
        name: candidate['name'],
        email: candidate['email'],
        role,
      };
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const [encodedPayload] = token.split('.');

    if (!encodedPayload) {
      return true;
    }

    try {
      const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      const expiration = payload['exp'];

      return typeof expiration !== 'number' || expiration * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  private readFromStorage(storage: AuthStorage | null, key: string): string | null {
    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  private removeFromStorage(storage: AuthStorage | null): void {
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      storage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
      return;
    }
  }

  private getLocalStorage(): AuthStorage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }

  private getSessionStorage(): AuthStorage | null {
    try {
      return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    } catch {
      return null;
    }
  }
}
