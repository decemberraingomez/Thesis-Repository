/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Thesis } from '../../models/thesis.model';
import { ThesisDetail } from './thesis-detail';

const sampleThesis: Thesis = {
  _id: '65f1d1f1f1f1f1f1f1f1f1f1',
  title: 'Computer Vision Foliage Pathology',
  abstract: 'Convolutional neural networks trained on brassica foliage imagery.',
  authors: ['Jezreel Onos'],
  adviser: 'Dr. A. Carino',
  year: 2025,
  category: 'Artificial Intelligence',
  status: 'Archived',
  defenseDate: '2025-04-18T00:00:00.000Z',
};

describe('ThesisDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the record, generates citations, and deletes only after confirmation', () => {
    TestBed.configureTestingModule({
      imports: [ThesisDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: sampleThesis._id as string }),
            },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ThesisDetail);
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    const getRequest = http.expectOne(
      `http://localhost:5000/api/theses/${sampleThesis._id}`
    );
    getRequest.flush({ data: sampleThesis });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.detail__title')?.textContent).toContain(sampleThesis.title);
    expect(host.querySelectorAll('.citation__text').length).toBe(2);

    const deleteButton = host.querySelector<HTMLButtonElement>('.action-stack .btn--danger');
    expect(deleteButton).not.toBeNull();
    deleteButton?.click();
    fixture.detectChanges();

    http.expectNone(`http://localhost:5000/api/theses/${sampleThesis._id}`);
    expect(host.querySelector('.dialog')).not.toBeNull();

    const dialogButtons = host.querySelectorAll<HTMLButtonElement>('.dialog__button');
    dialogButtons[1].click();
    fixture.detectChanges();

    const deleteRequest = http.expectOne(
      `http://localhost:5000/api/theses/${sampleThesis._id}`
    );
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(navigateSpy).toHaveBeenCalledWith(['/theses']);

    http.verify();
  });
});
