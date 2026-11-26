/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Thesis } from '../models/thesis.model';
import { API_BASE_URL, resolveApiBaseUrl, ThesisInput, ThesisService } from './thesis.service';

const sampleThesis: Thesis = {
  _id: '65f1d1f1f1f1f1f1f1f1f1f1',
  title: 'Automated Thesis Indexing',
  abstract: 'An indexing pipeline for institutional repositories.',
  authors: ['Jezreel Onos'],
  adviser: 'Engr. R. Santos',
  year: 2026,
  category: 'Software Engineering',
  status: 'Published',
  defenseDate: '2026-05-15T00:00:00.000Z',
};

const samplePayload: ThesisInput = {
  title: sampleThesis.title,
  abstract: sampleThesis.abstract,
  authors: sampleThesis.authors,
  adviser: sampleThesis.adviser,
  year: sampleThesis.year,
  category: sampleThesis.category,
  status: sampleThesis.status,
  defenseDate: sampleThesis.defenseDate as string,
};

describe('resolveApiBaseUrl', () => {
  const localApi = 'http://localhost:3000/api';
  const productionApi = 'https://thesis-repository.onrender.com/api';

  it('uses the local API for loopback, IPv6, LAN, and machine hostnames', () => {
    ['localhost', '127.0.0.1', '[::1]', '192.168.1.25', 'isen-desktop'].forEach((hostname) => {
      expect(resolveApiBaseUrl(hostname)).toBe(localApi);
    });
  });

  it('uses the production API only for Vercel frontend hostnames', () => {
    expect(resolveApiBaseUrl('thesis-repository.vercel.app')).toBe(productionApi);
    expect(
      resolveApiBaseUrl(
        'thesis-repository-git-refactor-consolidate-non-8da1d8-rainicie.vercel.app'
      )
    ).toBe(productionApi);
  });

  it('keeps the default test hostname on the local API', () => {
    expect(API_BASE_URL).toBe(localApi);
  });
});

describe('ThesisService', () => {
  let service: ThesisService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ThesisService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('fetches the thesis list from the internal API', () => {
    let result: Thesis[] = [];

    service.getTheses().subscribe((theses) => {
      result = theses;
    });

    const request = httpTesting.expectOne(`${API_BASE_URL}/theses`);
    expect(request.request.method).toBe('GET');
    request.flush([sampleThesis]);

    expect(result.length).toBe(1);
    expect(result[0].title).toBe(sampleThesis.title);
  });

  it('creates a thesis through POST /api/theses', () => {
    let created: Thesis | null = null;

    service.createThesis(samplePayload).subscribe((thesis) => {
      created = thesis;
    });

    const request = httpTesting.expectOne(`${API_BASE_URL}/theses`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(samplePayload);
    request.flush(sampleThesis, { status: 201, statusText: 'Created' });

    expect(created).not.toBeNull();
  });

  it('updates a thesis through PUT /api/theses/:id', () => {
    service.updateThesis(sampleThesis._id as string, samplePayload).subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/theses/${sampleThesis._id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(sampleThesis);

    expect(request.request.body).toEqual(samplePayload);
  });

  it('deletes a thesis through DELETE /api/theses/:id', () => {
    let completed = false;

    service.deleteThesis(sampleThesis._id as string).subscribe({
      complete: () => {
        completed = true;
      },
    });

    const request = httpTesting.expectOne(`${API_BASE_URL}/theses/${sampleThesis._id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Thesis deleted' }, { status: 200, statusText: 'OK' });

    expect(completed).toBe(true);
  });

  it('formats API validation errors for display', () => {
    let message = '';

    service.getThesis('missing').subscribe({
      error: (error: unknown) => {
        message = service.describeError(error);
      },
    });

    const request = httpTesting.expectOne(`${API_BASE_URL}/theses/missing`);
    request.flush(
      { message: 'Validation failed', errors: ['Title is required'] },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(message).toContain('Validation failed');
    expect(message).toContain('Title is required');
  });
});
