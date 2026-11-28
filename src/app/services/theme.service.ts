/**
 * Author: Andrada, Jim Magnus C.
 * Date: November 25, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'thesis-repo.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeState = signal<Theme>(this.readInitialTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    this.apply(this.themeState());
  }

  toggle(): void {
    this.set(this.themeState() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.themeState.set(theme);
    this.apply(theme);
    this.persist(theme);
  }

  private readInitialTheme(): Theme {
    const fromDocument = this.readDocumentTheme();

    if (fromDocument) {
      return fromDocument;
    }

    const stored = this.readStoredTheme();

    if (stored) {
      return stored;
    }

    return this.prefersDark() ? 'dark' : 'light';
  }

  private readDocumentTheme(): Theme | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const current = document.documentElement.dataset['theme'];

    return current === 'dark' || current === 'light' ? current : null;
  }

  private readStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);

      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }

  private prefersDark(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }

  private apply(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset['theme'] = theme;
  }

  private persist(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }
}
