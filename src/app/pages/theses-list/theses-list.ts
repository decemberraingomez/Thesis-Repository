/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { Thesis } from '../../models/thesis.model';
import { ThesisService } from '../../services/thesis.service';

@Component({
  selector: 'app-theses-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './theses-list.html',
  styleUrl: './theses-list.css',
})
export class ThesesList implements OnInit {
  private readonly thesisService = inject(ThesisService);

  protected readonly theses = signal<Thesis[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly query = signal('');
  protected readonly pendingDelete = signal<Thesis | null>(null);
  protected readonly deleting = signal(false);

  protected readonly filteredTheses = computed(() => {
    const term = this.query().trim().toLowerCase();

    if (!term) {
      return this.theses();
    }

    return this.theses().filter((thesis) => {
      const haystack = [
        thesis.title,
        thesis.abstract,
        thesis.adviser,
        thesis.category,
        thesis.status,
        ...thesis.authors,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  });

  protected readonly deleteDialogOpen = computed(() => this.pendingDelete() !== null);

  protected readonly deleteMessage = computed(() => {
    const thesis = this.pendingDelete();
    const title = thesis ? `"${thesis.title}"` : 'this thesis';
    return `Delete ${title}? This permanently removes the record from MongoDB.`;
  });

  ngOnInit(): void {
    this.loadTheses();
  }

  protected loadTheses(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.thesisService.getTheses().subscribe({
      next: (theses) => {
        this.loading.set(false);
        this.theses.set(theses);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.thesisService.describeError(error));
      },
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.query.set(target.value);
    }
  }

  protected requestDelete(thesis: Thesis): void {
    if (!this.deleting()) {
      this.pendingDelete.set(thesis);
      this.successMessage.set('');
      this.errorMessage.set('');
    }
  }

  protected cancelDelete(): void {
    if (!this.deleting()) {
      this.pendingDelete.set(null);
    }
  }

  protected confirmDelete(): void {
    const thesis = this.pendingDelete();

    if (!thesis?._id) {
      this.pendingDelete.set(null);
      this.errorMessage.set('This thesis cannot be deleted because it has no record id.');
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');

    this.thesisService.deleteThesis(thesis._id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.theses.update((items) => items.filter((item) => item._id !== thesis._id));
        this.successMessage.set(`Deleted "${thesis.title}" from the repository.`);
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.errorMessage.set(this.thesisService.describeError(error));
      },
    });
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
