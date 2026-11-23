/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
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
  id: '65f1d1f1f1f1f1f1f1f1f1f1f',
  name: 'Library Administrator',
  email: 'admin@example.edu',
  role: 'admin',
};

const TEST_EMAIL = 'admin@example.edu';
const TEST_PASSWORD = 'TestAdminPass123!';

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

  it('renders no demo credentials or autofill control', () => {
    const fixture = TestBed.createComponent(Login);

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(host.querySelectorAll('button'));

    expect(buttons).toHaveLength(1);
    expect(host.textContent?.toLowerCase()).not.toContain('demo');
    expect(host.textContent).not.toContain('TestAdminPass123!');
  });

  it('completes the admin login flow from manually entered credentials', () => {
    const fixture = TestBed.createComponent(Login);
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();

    const api = fixture.componentInstance as unknown as LoginTestApi;
    api.form.setValue({ email: TEST_EMAIL, password: TEST_PASSWORD, remember: true });

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
      email: TEST_EMAIL,
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
