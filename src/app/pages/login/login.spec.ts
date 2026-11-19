/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { AuthUser, LoginResponse } from '../../models/auth.model';
import { API_BASE_URL } from '../../services/thesis.service';
import { Login } from './login';

interface LoginTestApi {
  form: FormGroup;
  onSubmit: () => void;
}

const adminUser: AuthUser = {
  name: 'Library Administrator',
  email: 'admin@ubaguio.edu',
  role: 'admin',
};

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('fills the demo credentials and completes the admin login flow', () => {
    const fixture = TestBed.createComponent(Login);
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const fillButton = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Fill Demo Admin Credentials')
    );
    expect(fillButton).not.toBeUndefined();
    fillButton?.click();
    fixture.detectChanges();

    const api = fixture.componentInstance as unknown as LoginTestApi;
    expect(api.form.controls['email'].value).toBe('admin@ubaguio.edu');
    expect(api.form.controls['password'].value).toBe('ThesisAdmin2026!');

    api.onSubmit();

    const request = http.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({ token: 'signed-admin-token', user: adminUser } satisfies LoginResponse);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith('/theses');
    http.verify();
  });

  it('shows the API error message for invalid credentials', () => {
    const fixture = TestBed.createComponent(Login);
    const http = TestBed.inject(HttpTestingController);
    const api = fixture.componentInstance as unknown as LoginTestApi;

    fixture.detectChanges();

    api.form.patchValue({
      email: 'admin@ubaguio.edu',
      password: 'wrong-password',
    });
    api.onSubmit();

    http
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush({ message: 'Invalid admin email or password.' }, {
        status: 401,
        statusText: 'Unauthorized',
      });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.alert--error')?.textContent).toContain(
      'Invalid admin email or password.'
    );
    http.verify();
  });
});
