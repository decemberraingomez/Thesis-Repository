/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { Thesis } from '../../models/thesis.model';
import {
  ExternalReferenceService,
  ReferenceMetadata,
} from '../../services/external-reference.service';
import { ThesisService } from '../../services/thesis.service';

@Component({
  selector: 'app-thesis-detail',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './thesis-detail.html',
  styleUrl: './thesis-detail.css',
})
export class ThesisDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly thesisService = inject(ThesisService);
  private readonly referenceService = inject(ExternalReferenceService);

  protected readonly thesis = signal<Thesis | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly actionError = signal('');
  protected readonly successMessage = signal('');

  protected readonly deleteDialogOpen = signal(false);
  protected readonly deleting = signal(false);

  protected readonly referenceBusy = signal(false);
  protected readonly referenceError = signal('');
  protected readonly referenceResults = signal<ReferenceMetadata[]>([]);

  protected readonly apaCitation = computed(() => {
    const record = this.thesis();
    return record ? this.referenceService.buildApaCitation(record) : '';
  });

  protected readonly ieeeCitation = computed(() => {
    const record = this.thesis();
    return record ? this.referenceService.buildIeeeCitation(record) : '';
  });

  protected readonly deleteMessage = computed(() => {
    const record = this.thesis();
    const title = record ? `"${record.title}"` : 'this thesis';
    return `Delete ${title}? The record will be permanently removed from the repository and MongoDB.`;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('No thesis id was provided.');
      return;
    }

    this.loadThesis(id);
  }

  protected loadThesis(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.thesisService.getThesis(id).subscribe({
      next: (record) => {
        this.loading.set(false);
        this.thesis.set(record);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.thesisService.describeError(error));
      },
    });
  }

  protected openDeleteDialog(): void {
    if (!this.deleting()) {
      this.deleteDialogOpen.set(true);
      this.actionError.set('');
    }
  }

  protected cancelDelete(): void {
    if (!this.deleting()) {
      this.deleteDialogOpen.set(false);
    }
  }

  protected confirmDelete(): void {
    const record = this.thesis();

    if (!record?._id) {
      this.deleteDialogOpen.set(false);
      this.actionError.set('This thesis cannot be deleted because it has no record id.');
      return;
    }

    this.deleting.set(true);
    this.actionError.set('');

    this.thesisService.deleteThesis(record._id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteDialogOpen.set(false);
        this.successMessage.set('Thesis deleted successfully. Returning to the repository...');
        window.setTimeout(() => {
          void this.router.navigate(['/theses']);
        }, 900);
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.deleteDialogOpen.set(false);
        this.actionError.set(this.thesisService.describeError(error));
      },
    });
  }

  protected searchExternalReferences(): void {
    const record = this.thesis();

    if (!record) {
      return;
    }

    this.referenceBusy.set(true);
    this.referenceError.set('');

    this.referenceService.searchByTitle(record.title).subscribe({
      next: (references) => {
        this.referenceBusy.set(false);
        this.referenceResults.set(references.slice(0, 3));

        if (references.length === 0) {
          this.referenceError.set(
            'Crossref returned no matches. Citations from the repository metadata are still available.'
          );
        }
      },
      error: (error: unknown) => {
        this.referenceBusy.set(false);
        this.referenceResults.set([]);
        const message =
          error instanceof Error
            ? error.message
            : 'The external reference service could not be reached.';
        this.referenceError.set(
          `${message} Citations from the repository metadata are still available.`
        );
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
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }

  protected formatDateTime(value: string | Date | undefined): string {
    if (!value) {
      return 'Not available';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
