/**
 * Author: Jezreel M. Onos
 * Date: November 25, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [FormsModule],
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing {
  private readonly router = inject(Router);

  protected readonly query = signal('');

  protected onSearchInput(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.query.set(target.value);
    }
  }

  protected onSearch(event: Event): void {
    event.preventDefault();
    const term = this.query().trim();

    void this.router.navigate(['/theses'], term ? { queryParams: { q: term } } : {});
  }
}
