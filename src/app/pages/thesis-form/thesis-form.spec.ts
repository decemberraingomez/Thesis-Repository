/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Thesis } from '../../models/thesis.model';
import { ThesisForm } from './thesis-form';

const existingThesis: Thesis = {
  _id: '65f1d1f1f1f1f1f1f1f1f1f1',
  title: 'Zero-Trust Campus Network Segmentation',
  abstract: 'Policy-driven VLAN routing for laboratory networks.',
  authors: ['Kirk Romero', 'Edrel Aquino'],
  adviser: 'Engr. F. Del Rosario',
  year: 2025,
  category: 'Network & Security',
  status: 'Published',
  defenseDate: '2025-11-20T00:00:00.000Z',
};

interface ThesisFormTestApi {
  form: FormGroup;
}

const getForm = (component: ThesisForm): FormGroup => {
  const api = component as unknown as ThesisFormTestApi;
  return api.form;
};

const createComponent = (id: string | null): { component: ThesisForm; http: HttpTestingController } => {
  TestBed.configureTestingModule({
    imports: [ThesisForm],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: convertToParamMap(id ? { id } : {}),
          },
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(ThesisForm);
  fixture.detectChanges();

  return {
    component: fixture.componentInstance,
    http: TestBed.inject(HttpTestingController),
  };
};

describe('ThesisForm', () => {
  it('starts invalid and exposes field-level validation errors', () => {
    const { component } = createComponent(null);
    const form = getForm(component);

    expect(form.invalid).toBe(true);

    const title = form.get('title') as AbstractControl;
    title.markAsTouched();

    expect(title.hasError('required')).toBe(true);
    expect(form.get('authors')?.invalid).toBe(true);
    expect(form.get('adviser')?.invalid).toBe(true);
    expect(form.get('defenseDate')?.invalid).toBe(true);
  });

  it('becomes valid when every required field is populated', () => {
    const { component } = createComponent(null);
    const form = getForm(component);
    const authors = form.get('authors') as FormArray;

    form.patchValue({
      title: 'Institutional Academic Repository',
      abstract: 'A decoupled single-page application for thesis metadata.',
      adviser: 'Prof. L. Mendoza',
      year: 2026,
      category: 'Web & Mobile Development',
      status: 'Under Review',
      defenseDate: '2026-11-05',
    });
    authors.at(0).setValue('Jim Magnus Andrada');

    expect(form.valid).toBe(true);
  });

  it('pre-fills every control when editing an existing thesis', () => {
    const { component, http } = createComponent(existingThesis._id as string);

    const request = http.expectOne(
      `http://localhost:3000/api/theses/${existingThesis._id}`
    );
    expect(request.request.method).toBe('GET');
    request.flush(existingThesis);

    const form = getForm(component);

    expect(form.get('title')?.value).toBe(existingThesis.title);
    expect(form.get('abstract')?.value).toBe(existingThesis.abstract);
    expect(form.get('adviser')?.value).toBe(existingThesis.adviser);
    expect(form.get('year')?.value).toBe(existingThesis.year);
    expect(form.get('category')?.value).toBe(existingThesis.category);
    expect(form.get('status')?.value).toBe(existingThesis.status);
    expect(form.get('defenseDate')?.value).toBe('2025-11-20');

    const authors = form.get('authors') as FormArray;
    expect(authors.length).toBe(2);
    expect(authors.at(0).value).toBe('Kirk Romero');

    http.verify();
  });
});
