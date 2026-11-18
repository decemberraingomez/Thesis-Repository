/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Thesis } from '../models/thesis.model';
import { ExternalReferenceService, ReferenceMetadata } from './external-reference.service';

const sampleThesis: Thesis = {
  title: 'Institutional Academic Repository',
  abstract: 'A decoupled single-page application for thesis metadata.',
  authors: ['Jim Magnus Andrada', 'December Rain Gomez'],
  adviser: 'Prof. L. Mendoza',
  year: 2026,
  category: 'Web & Mobile Development',
  status: 'Under Review',
  defenseDate: '2026-11-05T00:00:00.000Z',
};

describe('ExternalReferenceService', () => {
  let service: ExternalReferenceService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ExternalReferenceService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('builds APA and IEEE citations from saved thesis metadata', () => {
    const apa = service.buildApaCitation(sampleThesis);
    const ieee = service.buildIeeeCitation(sampleThesis);

    expect(apa).toContain('Andrada, J. M.');
    expect(apa).toContain('(2026)');
    expect(apa).toContain('Institutional Academic Repository');
    expect(ieee).toContain('J. M. Andrada');
    expect(ieee).toContain('2026');
  });

  it('maps Crossref DOI metadata into citation strings', () => {
    const holder: { value: ReferenceMetadata | null } = { value: null };

    service.lookupByDoi('https://doi.org/10.1000/xyz123').subscribe((result) => {
      holder.value = result;
    });

    const request = httpTesting.expectOne('https://api.crossref.org/works/10.1000%2Fxyz123');
    expect(request.request.method).toBe('GET');
    request.flush({
      message: {
        DOI: '10.1000/xyz123',
        title: ['A Crossref Reference'],
        author: [{ given: 'Jane', family: 'Doe' }],
        issued: { 'date-parts': [[2024]] },
        publisher: 'Example Press',
        URL: 'https://doi.org/10.1000/xyz123',
      },
    });

    expect(holder.value).not.toBeNull();
    const metadata = holder.value;

    if (!metadata) {
      throw new Error('Expected Crossref metadata to be mapped.');
    }

    expect(metadata.title).toBe('A Crossref Reference');
    expect(metadata.authors[0]).toBe('Jane Doe');
    expect(metadata.year).toBe('2024');
    expect(metadata.apa).toContain('Doe, J.');
    expect(metadata.ieee).toContain('J. Doe');
  });

  it('fails gracefully when the external service is rate limited', () => {
    let message = '';

    service.searchByTitle('Thesis repository').subscribe({
      error: (error: unknown) => {
        message = error instanceof Error ? error.message : '';
      },
    });

    const request = httpTesting.expectOne(
      (candidate) => candidate.url === 'https://api.crossref.org/works'
    );
    request.flush({ message: 'rate limited' }, { status: 429, statusText: 'Too Many Requests' });

    expect(message).toContain('rate limiting');
  });
});
