/**
 * Author: Jezreel M. Onos
 * Date: November 25, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Thesis } from '../../models/thesis.model';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from '../../services/auth.service';
import { API_BASE_URL } from '../../services/thesis.service';
import { ThesesList } from './theses-list';

const seedAdminSession = (): void => {
  const expiration = Math.floor(Date.now() / 1000) + 3600;
  const payload = btoa(JSON.stringify({ exp: expiration }));
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, `${payload}.test-signature`);
  localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({
      id: '65f1d1f1f1f1f1f1f1f1f1f1f',
      name: 'Library Administrator',
      email: 'admin@ubaguio.edu',
      role: 'admin',
    })
  );
};

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

const configure = (): void => {
  TestBed.configureTestingModule({
    imports: [ThesesList],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
};

describe('ThesesList', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    seedAdminSession();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('requires confirmation before deleting and removes the card after success', () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const listRequest = http.expectOne(`${API_BASE_URL}/theses?sort=newest`);
    listRequest.flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('app-thesis-card').length).toBe(1);

    const deleteButton = host.querySelector<HTMLButtonElement>('button.btn--danger');
    expect(deleteButton).not.toBeNull();
    deleteButton?.click();
    fixture.detectChanges();

    http.expectNone(`${API_BASE_URL}/theses/${sampleThesis._id}`);
    expect(host.querySelector('.dialog')).not.toBeNull();

    const dialogButtons = host.querySelectorAll<HTMLButtonElement>('.dialog__button');
    dialogButtons[1].click();
    fixture.detectChanges();

    const deleteRequest = http.expectOne(`${API_BASE_URL}/theses/${sampleThesis._id}`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({ message: 'Thesis deleted' }, { status: 200, statusText: 'OK' });
    fixture.detectChanges();

    expect(host.querySelectorAll('app-thesis-card').length).toBe(0);
    expect(host.querySelector('.alert--success')?.textContent).toContain('Deleted');

    http.verify();
  });

  it('sends the chosen sort order to the API', () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/theses?sort=newest`).flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const sortSelect = host.querySelector<HTMLSelectElement>('select#sort');
    expect(sortSelect).not.toBeNull();

    sortSelect!.value = 'title';
    sortSelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const sorted = http.expectOne(`${API_BASE_URL}/theses?sort=title`);
    expect(sorted.request.method).toBe('GET');
    sorted.flush([sampleThesis]);

    http.verify();
  });

  it('sends the selected category and status filters to the API', () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/theses?sort=newest`).flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    const categorySelect = host.querySelector<HTMLSelectElement>('select#category');
    categorySelect!.value = 'Software Engineering';
    categorySelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    http
      .expectOne(
        (req) => req.url === `${API_BASE_URL}/theses` && req.params.get('category') !== null
      )
      .flush([sampleThesis]);

    const statusSelect = host.querySelector<HTMLSelectElement>('select#status');
    statusSelect!.value = 'Published';
    statusSelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    http
      .expectOne((req) => req.url === `${API_BASE_URL}/theses` && req.params.get('status') !== null)
      .flush([sampleThesis]);

    http.verify();
  });

  it('debounces the search term before calling the API', async () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/theses?sort=newest`).flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector<HTMLInputElement>('input[type="search"]');
    expect(searchInput).not.toBeNull();

    searchInput!.value = 'index';
    searchInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    http.expectNone(
      (req) => req.url === `${API_BASE_URL}/theses` && req.params.get('search') === 'index'
    );

    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    const searched = http.expectOne(
      (req) => req.url === `${API_BASE_URL}/theses` && req.params.get('search') === 'index'
    );
    searched.flush([sampleThesis]);

    http.verify();
  });

  it('keeps spaces in the search input while typing', async () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/theses?sort=newest`).flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector<HTMLInputElement>('input[type="search"]')!;

    searchInput.value = 'machine l';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    http
      .expectOne(
        (req) => req.url === `${API_BASE_URL}/theses` && req.params.get('search') === 'machine l'
      )
      .flush([sampleThesis]);
    fixture.detectChanges();

    expect(searchInput.value).toBe('machine l');
    http.verify();
  });

  it('searches again with the same term after clearing filters', async () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/theses?sort=newest`).flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector<HTMLInputElement>('input[type="search"]')!;

    searchInput.value = 'index';
    searchInput.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();
    http
      .expectOne((req) => req.url === `${API_BASE_URL}/theses` && req.params.get('search') === 'index')
      .flush([sampleThesis]);
    fixture.detectChanges();

    host.querySelector<HTMLButtonElement>('.results__clear')?.click();
    fixture.detectChanges();
    http
      .expectOne(
        (req) => req.url === `${API_BASE_URL}/theses` && !req.params.has('search')
      )
      .flush([sampleThesis]);
    fixture.detectChanges();

    searchInput.value = 'index';
    searchInput.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    http
      .expectOne((req) => req.url === `${API_BASE_URL}/theses` && req.params.get('search') === 'index')
      .flush([sampleThesis]);

    http.verify();
  });

  it('keeps searching after a failed request', async () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http
      .expectOne(`${API_BASE_URL}/theses?sort=newest`)
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.alert--error')).toBeTruthy();

    const searchInput = host.querySelector<HTMLInputElement>('input[type="search"]')!;

    searchInput.value = 'index';
    searchInput.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    const retried = http.expectOne(
      (req) => req.url === `${API_BASE_URL}/theses` && req.params.get('search') === 'index'
    );
    retried.flush([sampleThesis]);
    fixture.detectChanges();

    expect(host.querySelectorAll('app-thesis-card').length).toBe(1);

    http.verify();
  });
});
