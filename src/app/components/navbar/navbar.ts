/**
 * Author: Andrada, Jim Magnus C.
 * Co-author: Jezreel M. Onos
 * Date: November 28, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ChangePassword } from '../change-password/change-password';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ChangePassword],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly passwordDialogOpen = signal(false);
  protected readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.closeMenu());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  protected openPasswordDialog(): void {
    this.passwordDialogOpen.set(true);
    this.closeMenu();
  }

  protected closePasswordDialog(): void {
    this.passwordDialogOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  protected dismissNotice(): void {
    this.authService.dismissNotice();
  }
}
