/**
 * Author: Andrada, Jim Magnus C.
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App routing shell', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('redirects the empty path to home', async () => {
    await router.navigateByUrl('/');
    expect(router.url).toBe('/home');
  });

  it('resolves the required routes', () => {
    const paths = routes.map((route) => route.path);

    expect(paths).toContain('');
    expect(paths).toContain('home');
    expect(paths).toContain('theses');
    expect(paths).toContain('theses/new');
    expect(paths).toContain('theses/:id/edit');
    expect(paths).toContain('theses/:id');
    expect(paths).toContain('**');
  });

  it('keeps the wildcard route last and defines no component for the empty path', () => {
    const emptyPathRoute = routes.find((route) => route.path === '');

    expect(routes[routes.length - 1].path).toBe('**');
    expect(emptyPathRoute?.redirectTo).toBe('home');
    expect(emptyPathRoute?.loadComponent).toBeUndefined();
  });

  it('orders the create and edit routes before the detail route', () => {
    const paths = routes.map((route) => route.path);

    expect(paths.indexOf('theses/new')).toBeLessThan(paths.indexOf('theses/:id'));
    expect(paths.indexOf('theses/:id/edit')).toBeLessThan(paths.indexOf('theses/:id'));
  });

  it('renders the navbar outside the router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const navbar = compiled.querySelector('app-navbar');
    const outlet = compiled.querySelector('router-outlet');

    expect(navbar).toBeTruthy();
    expect(outlet).toBeTruthy();
    expect(navbar?.closest('router-outlet')).toBeNull();
  });
});
