/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

const runGuard = (isAdmin: boolean): unknown => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: { isAdmin: () => isAdmin },
      },
    ],
  });

  return TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, { url: '/theses/new' } as RouterStateSnapshot)
  );
};

describe('adminGuard', () => {
  it('allows administrators into protected routes', () => {
    expect(runGuard(true)).toBe(true);
  });

  it('redirects public users to login with a return URL', () => {
    const result = runGuard(false);

    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toContain('/login?redirectTo=%2Ftheses%2Fnew');
  });
});
