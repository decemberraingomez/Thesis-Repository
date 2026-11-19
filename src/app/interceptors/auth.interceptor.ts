/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../services/thesis.service';

const isApiRequest = (url: string): boolean =>
  url.startsWith(`${API_BASE_URL}/`) || url.includes('/api/');

const isLoginRequest = (url: string): boolean => url.includes('/auth/login');

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  const authorizedRequest =
    token && isApiRequest(request.url) && !isLoginRequest(request.url)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        isApiRequest(request.url) &&
        !isLoginRequest(request.url) &&
        (error.status === 401 || error.status === 403)
      ) {
        authService.notifyAuthFailure(error.status);
      }

      return throwError(() => error);
    })
  );
};
