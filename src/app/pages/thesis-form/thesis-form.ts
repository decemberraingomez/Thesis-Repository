/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  THESIS_CATEGORIES,
  THESIS_STATUSES,
  Thesis,
  ThesisCategory,
  ThesisStatus,
} from '../../models/thesis.model';
import { ExternalReferenceService, ReferenceMetadata } from '../../services/external-reference.service';
import { ThesisInput, ThesisService } from '../../services/thesis.service';

const MAX_YEAR = new Date().getFullYear() + 1;

const AUTHOR_VALIDATORS = [Validators.required, Validators.maxLength(120)];

@Component({
  selector: 'app-thesis-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './thesis-form.html',
  styleUrl: './thesis-form.css',
})
export class ThesisForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly thesisService = inject(ThesisService);
  private readonly referenceService = inject(ExternalReferenceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly categories = THESIS_CATEGORIES;
  protected readonly statuses = THESIS_STATUSES;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly maxYear = MAX_YEAR;

  protected readonly thesisId = signal<string | null>(null);
  protected readonly isEditMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly serverErrors = signal<string[]>([]);
  protected readonly referenceBusy = signal(false);
  protected readonly referenceMessage = signal('');
  protected readonly referenceError = signal('');
  protected readonly referencePreview = signal<ReferenceMetadata | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    title: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    abstract: this.formBuilder.nonNullable.control('', [Validators.required]),
    authors: this.formBuilder.nonNullable.array([
      this.formBuilder.nonNullable.control('', AUTHOR_VALIDATORS),
    ]),
    adviser: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    year: this.formBuilder.nonNullable.control(this.currentYear, [
      Validators.required,
      Validators.min(2000),
      Validators.max(MAX_YEAR),
    ]),
    category: this.formBuilder.nonNullable.control<ThesisCategory>('Artificial Intelligence', [
      Validators.required,
    ]),
    status: this.formBuilder.nonNullable.control<ThesisStatus>('Under Review', [
      Validators.required,
    ]),
    defenseDate: this.formBuilder.nonNullable.control('', [Validators.required]),
    doiLookup: this.formBuilder.nonNullable.control(''),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.thesisId.set(id);
      this.isEditMode.set(true);
      this.loadThesis(id);
    }
  }

  protected get authors(): FormArray<FormControl<string>> {
    return this.form.controls.authors;
  }

  protected showError(control: AbstractControl, error: string): boolean {
    return (control.touched || control.dirty) && control.hasError(error);
  }

  protected addAuthor(): void {
    this.authors.push(this.formBuilder.nonNullable.control('', AUTHOR_VALIDATORS));
    this.form.markAsDirty();
  }

  protected removeAuthor(index: number): void {
    if (this.authors.length > 1) {
      this.authors.removeAt(index);
      this.form.markAsDirty();
    }
  }

  protected lookupReference(): void {
    const doi = this.form.controls.doiLookup.value.trim();

    if (!doi) {
      this.referenceError.set('Enter a DOI to fetch reference metadata.');
      this.referenceMessage.set('');
      return;
    }

    this.referenceBusy.set(true);
    this.referenceError.set('');
    this.referenceMessage.set('');

    this.referenceService.lookupByDoi(doi).subscribe({
      next: (reference) => {
        this.referenceBusy.set(false);
        this.referencePreview.set(reference);
        this.applyReference(reference);
        this.referenceMessage.set(
          'Metadata loaded from Crossref. Review the fields before saving.'
        );
      },
      error: (error: unknown) => {
        this.referenceBusy.set(false);
        this.referencePreview.set(null);
        this.referenceError.set(this.toMessage(error));
      },
    });
  }

  protected onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.serverErrors.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please correct the highlighted fields before submitting.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ThesisInput = {
      title: raw.title.trim(),
      abstract: raw.abstract.trim(),
      authors: raw.authors.map((author) => author.trim()).filter((author) => author.length > 0),
      adviser: raw.adviser.trim(),
      year: Number(raw.year),
      category: raw.category,
      status: raw.status,
      defenseDate: new Date(raw.defenseDate).toISOString(),
    };

    this.submitting.set(true);
    const id = this.thesisId();

    const request = id
      ? this.thesisService.updateThesis(id, payload)
      : this.thesisService.createThesis(payload);

    request.subscribe({
      next: (thesis) => {
        this.submitting.set(false);
        const message = id
          ? 'Thesis updated successfully. Changes have been saved.'
          : 'Thesis created successfully. The record has been saved.';
        this.successMessage.set(message);
        const targetId = thesis._id ?? id;
        const destination = targetId ? ['/theses', targetId] : ['/theses'];
        window.setTimeout(() => {
          void this.router.navigate(destination);
        }, 900);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.thesisService.describeError(error));
        this.serverErrors.set(this.extractServerErrors(error));
      },
    });
  }

  protected formatYears(): string {
    return `2000 to ${MAX_YEAR}`;
  }

  private loadThesis(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.thesisService.getThesis(id).subscribe({
      next: (thesis) => {
        this.loading.set(false);
        this.patchThesis(thesis);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.thesisService.describeError(error));
      },
    });
  }

  private patchThesis(thesis: Thesis): void {
    this.authors.clear();
    const authorControls =
      thesis.authors.length > 0
        ? thesis.authors.map((author) =>
            this.formBuilder.nonNullable.control(author, AUTHOR_VALIDATORS)
          )
        : [this.formBuilder.nonNullable.control('', AUTHOR_VALIDATORS)];
    authorControls.forEach((control) => this.authors.push(control));

    this.form.patchValue({
      title: thesis.title,
      abstract: thesis.abstract,
      adviser: thesis.adviser,
      year: Number(thesis.year),
      category: thesis.category,
      status: thesis.status,
      defenseDate: this.toDateInputValue(thesis.defenseDate),
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private applyReference(reference: ReferenceMetadata): void {
    const parsedYear = Number.parseInt(reference.year, 10);
    const validYear = Number.isFinite(parsedYear) && parsedYear >= 2000 && parsedYear <= MAX_YEAR;

    if (reference.title) {
      this.form.controls.title.setValue(reference.title.slice(0, 200));
    }

    if (reference.authors.length > 0) {
      this.authors.clear();
      reference.authors.forEach((author) => {
        this.authors.push(
          this.formBuilder.nonNullable.control(author.slice(0, 120), AUTHOR_VALIDATORS)
        );
      });
    }

    if (validYear) {
      this.form.controls.year.setValue(parsedYear);
    }
  }

  private toDateInputValue(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private extractServerErrors(error: unknown): string[] {
    if (typeof error !== 'object' || error === null) {
      return [];
    }

    const candidate = error as Record<string, unknown>;
    const body = candidate['error'];

    if (typeof body !== 'object' || body === null) {
      return [];
    }

    const errorBody = body as Record<string, unknown>;
    const errors = errorBody['errors'];

    return Array.isArray(errors)
      ? errors.filter((item): item is string => typeof item === 'string')
      : [];
  }

  private toMessage(error: unknown): string {
    return error instanceof Error
      ? error.message
      : 'The external reference service could not be reached.';
  }
}
