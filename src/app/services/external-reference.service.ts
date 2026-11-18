/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError, timeout } from 'rxjs';
import { Thesis } from '../models/thesis.model';

const CROSSREF_BASE_URL = 'https://api.crossref.org/works';

interface CrossrefAuthor {
  given?: string;
  family?: string;
  name?: string;
}

interface CrossrefDateParts {
  'date-parts'?: (number | string)[][];
}

interface CrossrefWork {
  DOI?: string;
  title?: string[];
  author?: CrossrefAuthor[];
  issued?: CrossrefDateParts;
  publisher?: string;
  URL?: string;
}

interface CrossrefWorkResponse {
  message: CrossrefWork;
}

interface CrossrefSearchResponse {
  message: {
    items: CrossrefWork[];
  };
}

export interface ReferenceMetadata {
  doi: string;
  title: string;
  authors: string[];
  year: string;
  publisher: string;
  url: string;
  apa: string;
  ieee: string;
}

@Injectable({ providedIn: 'root' })
export class ExternalReferenceService {
  private readonly http = inject(HttpClient);

  lookupByDoi(doi: string): Observable<ReferenceMetadata> {
    const normalizedDoi = doi.trim().replace(/^https?:\/\/doi\.org\//i, '');

    if (!normalizedDoi) {
      return throwError(() => new Error('Enter a DOI to look up reference metadata.'));
    }

    return this.http
      .get<CrossrefWorkResponse>(`${CROSSREF_BASE_URL}/${encodeURIComponent(normalizedDoi)}`)
      .pipe(
        timeout(10000),
        map((response) => this.toMetadata(response.message)),
        catchError((error: unknown) => throwError(() => this.toFriendlyError(error)))
      );
  }

  searchByTitle(title: string): Observable<ReferenceMetadata[]> {
    const query = title.trim();

    if (!query) {
      return throwError(() => new Error('A thesis title is required to search references.'));
    }

    return this.http
      .get<CrossrefSearchResponse>(CROSSREF_BASE_URL, {
        params: {
          'query.bibliographic': query,
          rows: '5',
          select: 'DOI,title,author,issued,publisher,URL',
        },
      })
      .pipe(
        timeout(10000),
        map((response) => response.message.items.map((item) => this.toMetadata(item))),
        catchError((error: unknown) => throwError(() => this.toFriendlyError(error)))
      );
  }

  buildApaCitation(thesis: Thesis): string {
    const authors = this.formatApaAuthors(thesis.authors);
    const year = this.extractYear(thesis.year);
    const title = this.ensureSentenceEnding(thesis.title);
    return `${authors} (${year}). ${title} [Unpublished thesis]. University of Baguio.`;
  }

  buildIeeeCitation(thesis: Thesis): string {
    const authors = this.formatIeeeAuthors(thesis.authors);
    const year = this.extractYear(thesis.year);
    return `${authors}, "${thesis.title.trim()}," University of Baguio, Baguio City, Philippines, ${year}.`;
  }

  private toMetadata(work: CrossrefWork): ReferenceMetadata {
    const title = work.title?.[0]?.trim() ?? 'Untitled reference';
    const authors = (work.author ?? [])
      .map((author) => {
        if (author.name) {
          return author.name.trim();
        }

        const given = author.given?.trim() ?? '';
        const family = author.family?.trim() ?? '';
        return `${given} ${family}`.trim();
      })
      .filter((author) => author.length > 0);
    const year = String(work.issued?.['date-parts']?.[0]?.[0] ?? 'n.d.');
    const publisher = work.publisher?.trim() ?? '';
    const doi = work.DOI?.trim() ?? '';
    const url = work.URL?.trim() ?? (doi ? `https://doi.org/${doi}` : '');

    return {
      doi,
      title,
      authors,
      year,
      publisher,
      url,
      apa: this.buildApaReference(authors, year, title, publisher, url),
      ieee: this.buildIeeeReference(authors, year, title, publisher, url),
    };
  }

  private buildApaReference(
    authors: string[],
    year: string,
    title: string,
    publisher: string,
    url: string
  ): string {
    const formattedAuthors = this.formatApaAuthors(authors);
    const source = publisher || 'Crossref';
    const link = url ? ` ${url}` : '';
    return `${formattedAuthors} (${year}). ${this.ensureSentenceEnding(title)} ${source}.${link}`;
  }

  private buildIeeeReference(
    authors: string[],
    year: string,
    title: string,
    publisher: string,
    url: string
  ): string {
    const formattedAuthors = this.formatIeeeAuthors(authors);
    const source = publisher ? `, ${publisher}` : '';
    const link = url ? ` [Online]. Available: ${url}` : '';
    return `${formattedAuthors}, "${title},"${source}, ${year}.${link}`;
  }

  private formatApaAuthors(authors: string[]): string {
    if (authors.length === 0) {
      return 'Unknown author.';
    }

    const formatted = authors.map((author) => {
      const parts = author.split(/\s+/).filter((part) => part.length > 0);
      if (parts.length < 2) {
        return author;
      }

      const family = parts[parts.length - 1];
      const initials = parts
        .slice(0, -1)
        .map((part) => `${part.charAt(0).toUpperCase()}.`)
        .join(' ');
      return `${family}, ${initials}`;
    });

    if (formatted.length === 1) {
      return `${formatted[0]}.`;
    }

    return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}.`;
  }

  private formatIeeeAuthors(authors: string[]): string {
    if (authors.length === 0) {
      return 'Unknown author';
    }

    const formatted = authors.map((author) => {
      const parts = author.split(/\s+/).filter((part) => part.length > 0);
      if (parts.length < 2) {
        return author;
      }

      const initials = parts
        .slice(0, -1)
        .map((part) => `${part.charAt(0).toUpperCase()}.`)
        .join(' ');
      return `${initials} ${parts[parts.length - 1]}`;
    });

    if (formatted.length === 1) {
      return formatted[0];
    }

    return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
  }

  private ensureSentenceEnding(value: string): string {
    const trimmed = value.trim();
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  }

  private extractYear(value: number): string {
    return Number.isFinite(value) ? String(value) : 'n.d.';
  }

  private toFriendlyError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new Error(
          'The external reference service is unavailable. Check your connection and try again.'
        );
      }

      if (error.status === 404) {
        return new Error('No reference was found for that DOI.');
      }

      if (error.status === 429) {
        return new Error('The external reference service is rate limiting requests. Try again later.');
      }

      return new Error(
        `The external reference service returned an error (HTTP ${error.status}).`
      );
    }

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return new Error('The external reference service took too long to respond.');
      }

      return error;
    }

    return new Error('The external reference service could not be reached.');
  }
}
