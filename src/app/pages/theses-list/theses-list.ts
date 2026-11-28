/**
 * Author: Jezreel M. Onos
 * Date: November 28, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, skip, switchMap } from 'rxjs';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { ThesisCard } from '../../components/thesis-card/thesis-card';
import { Thesis, THESIS_CATEGORIES, THESIS_STATUSES } from '../../models/thesis.model';
import { AuthService } from '../../services/auth.service';
import { ThesisService, ThesisSort } from '../../services/thesis.service';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-theses-list',
  imports: [RouterLink, ConfirmDialog, ThesisCard],
  templateUrl: './theses-list.html',
  styleUrl: './theses-list.css',
})
export class ThesesList implements OnInit {
  private readonly thesisService = inject(ThesisService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly authService = inject(AuthService);

  protected readonly categories = THESIS_CATEGORIES;
  protected readonly statuses = THESIS_STATUSES;

  protected readonly theses = signal<Thesis[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly query = signal('');
  protected readonly category = signal('');
  protected readonly status = signal('');
  protected readonly sort = signal<ThesisSort>('newest');
  protected readonly pendingDelete = signal<Thesis | null>(null);
  protected readonly deleting = signal(false);

  private readonly searchInput = new Subject<string>();
  private readonly reload = new Subject<void>();

  protected readonly hasFilters = computed(
    () => this.query().trim() !== '' || this.category() !== '' || this.status() !== ''
  );

  protected readonly deleteDialogOpen = computed(() => this.pendingDelete() !== null);

  protected readonly deleteMessage = computed(() => {
    const thesis = this.pendingDelete();
    const title = thesis ? `"${thesis.title}"` : 'this thesis';
    return `Delete ${title}? This permanently deletes the record from the repository.`;
  });

  constructor() {
    this.searchInput
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.reload.next());

    this.reload
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.errorMessage.set('');

          return this.thesisService.getTheses(this.currentQuery()).pipe(
            catchError((error: unknown) => {
              this.loading.set(false);
              this.errorMessage.set(this.thesisService.describeError(error));
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((theses) => {
        this.loading.set(false);
        this.theses.set(theses);
      });
  }

  ngOnInit(): void {
    const initialTerm = this.route.snapshot.queryParamMap.get('q') ?? '';

    if (initialTerm) {
      this.query.set(initialTerm);
    }

    this.loadTheses();

    this.route.queryParamMap
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const term = params.get('q') ?? '';

        if (term !== this.query().trim()) {
          this.query.set(term);
          this.searchInput.next(term);
        }
      });
  }

  protected loadTheses(): void {
    this.reload.next();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.query.set(target.value);
      this.syncUrl();
      this.searchInput.next(target.value);
    }
  }

  protected onCategoryChange(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLSelectElement) {
      this.category.set(target.value);
      this.loadTheses();
    }
  }

  protected onStatusChange(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLSelectElement) {
      this.status.set(target.value);
      this.loadTheses();
    }
  }

  protected onSortChange(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLSelectElement) {
      this.sort.set(target.value as ThesisSort);
      this.loadTheses();
    }
  }

  protected clearFilters(): void {
    this.query.set('');
    this.category.set('');
    this.status.set('');
    this.syncUrl(true);
    this.searchInput.next('');
    this.loadTheses();
  }

  protected requestDelete(thesis: Thesis): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage.set('Administrator login is required to delete thesis records.');
      return;
    }

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
    if (!this.authService.isAdmin()) {
      this.pendingDelete.set(null);
      this.errorMessage.set('Administrator login is required to delete thesis records.');
      return;
    }

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

  private currentQuery() {
    return {
      search: this.query(),
      category: this.category(),
      status: this.status(),
      sort: this.sort(),
    };
  }

  private syncUrl(clearQuery = false): void {
    const term = clearQuery ? '' : this.query().trim();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: term || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
