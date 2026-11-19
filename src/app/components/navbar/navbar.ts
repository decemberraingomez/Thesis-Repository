/**
 * Author: Andrada, Jim Magnus C.
 * Co-author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChangePassword } from '../change-password/change-password';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ChangePassword],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  protected readonly passwordDialogOpen = signal(false);

  protected openPasswordDialog(): void {
    this.passwordDialogOpen.set(true);
  }

  protected closePasswordDialog(): void {
    this.passwordDialogOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }

  protected dismissNotice(): void {
    this.authService.dismissNotice();
  }
}
