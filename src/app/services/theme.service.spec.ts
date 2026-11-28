/**
 * Author: Andrada, Jim Magnus C.
 * Date: November 26, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const resetDocumentTheme = (): void => {
    delete document.documentElement.dataset['theme'];
  };

  beforeEach(() => {
    localStorage.clear();
    resetDocumentTheme();
  });

  afterEach(() => {
    localStorage.clear();
    resetDocumentTheme();
  });

  it('applies the theme to the document element', () => {
    const service = TestBed.inject(ThemeService);

    expect(document.documentElement.dataset['theme']).toBe(service.theme());
  });

  it('toggles between dark and light', () => {
    const service = TestBed.inject(ThemeService);
    service.set('light');

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('persists the chosen theme so it survives a reload', () => {
    const service = TestBed.inject(ThemeService);
    service.set('dark');

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('reads the persisted theme when one is stored', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    resetDocumentTheme();

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('ignores an unusable stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse');
    resetDocumentTheme();

    const service = TestBed.inject(ThemeService);

    expect(['dark', 'light']).toContain(service.theme());
  });
});
