/**
 * Author: Andrada, Jim Magnus C.
 * Date: November 25, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Thesis } from '../../models/thesis.model';

@Component({
  selector: 'app-thesis-card',
  imports: [RouterLink],
  templateUrl: './thesis-card.html',
  styleUrl: './thesis-card.css',
})
export class ThesisCard {
  readonly thesis = input.required<Thesis>();
  readonly canManage = input<boolean>(false);
  readonly busy = input<boolean>(false);

  readonly remove = output<Thesis>();

  protected requestRemove(): void {
    if (!this.busy()) {
      this.remove.emit(this.thesis());
    }
  }

  protected formatDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
}
