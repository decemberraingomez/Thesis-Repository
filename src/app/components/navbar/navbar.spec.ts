/**
 * Author: Andrada, Jim Magnus C.
 * Date: November 26, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Navbar } from './navbar';

const stubRoutes = [
  { path: 'theses', children: [] },
  { path: 'home', children: [] },
  { path: 'login', children: [] },
];

const configure = (): void => {
  TestBed.configureTestingModule({
    imports: [Navbar],
    providers: [provideRouter(stubRoutes), provideHttpClient()],
  });
};

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders the primary navigation', () => {
    configure();

    const fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('nav[aria-label="Primary"]')).toBeTruthy();
    expect(host.querySelector('.menu-toggle')).toBeTruthy();
  });

  it('opens and closes the mobile menu from the toggle', () => {
    configure();

    const fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector<HTMLButtonElement>('.menu-toggle');
    const nav = host.querySelector<HTMLElement>('#primary-navigation');

    expect(nav?.classList.contains('nav--open')).toBe(false);

    toggle?.click();
    fixture.detectChanges();
    expect(nav?.classList.contains('nav--open')).toBe(true);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');

    toggle?.click();
    fixture.detectChanges();
    expect(nav?.classList.contains('nav--open')).toBe(false);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the mobile menu on every navigation end', async () => {
    configure();

    const fixture = TestBed.createComponent(Navbar);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const nav = host.querySelector<HTMLElement>('#primary-navigation');

    host.querySelector<HTMLButtonElement>('.menu-toggle')?.click();
    fixture.detectChanges();
    expect(nav?.classList.contains('nav--open')).toBe(true);

    await router.navigateByUrl('/theses');
    fixture.detectChanges();

    expect(nav?.classList.contains('nav--open')).toBe(false);
  });
});
