/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Thesis } from '../../models/thesis.model';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from '../../services/auth.service';
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

  it('requires confirmation before deleting and removes the row after success', () => {
    configure();

    const fixture = TestBed.createComponent(ThesesList);
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const listRequest = http.expectOne('http://localhost:3000/api/theses');
    listRequest.flush([sampleThesis]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.record').length).toBe(1);

    const deleteButton = host.querySelector<HTMLButtonElement>('button.record__button');
    expect(deleteButton).not.toBeNull();
    deleteButton?.click();
    fixture.detectChanges();

    http.expectNone(`http://localhost:3000/api/theses/${sampleThesis._id}`);
    expect(host.querySelector('.dialog')).not.toBeNull();

    const dialogButtons = host.querySelectorAll<HTMLButtonElement>('.dialog__button');
    dialogButtons[1].click();
    fixture.detectChanges();

    const deleteRequest = http.expectOne(
      `http://localhost:3000/api/theses/${sampleThesis._id}`
    );
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({ message: 'Thesis deleted' }, { status: 200, statusText: 'OK' });
    fixture.detectChanges();

    expect(host.querySelectorAll('.record').length).toBe(0);
    expect(host.querySelector('.alert--success')?.textContent).toContain('Deleted');

    http.verify();
  });
});
