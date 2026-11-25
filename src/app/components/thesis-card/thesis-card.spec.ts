/**
 * Author: Andrada, Jim Magnus C.
 * Date: November 25, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Thesis } from '../../models/thesis.model';
import { ThesisCard } from './thesis-card';

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
    imports: [ThesisCard],
    providers: [provideRouter([])],
  });
};

describe('ThesisCard', () => {
  it('renders the thesis details supplied through its input', () => {
    configure();

    const fixture = TestBed.createComponent(ThesisCard);
    fixture.componentRef.setInput('thesis', sampleThesis);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.card__title')?.textContent).toContain(sampleThesis.title);
    expect(host.textContent).toContain(sampleThesis.authors[0]);
    expect(host.textContent).toContain(sampleThesis.adviser);
    expect(host.textContent).toContain(String(sampleThesis.year));
  });

  it('links to the detail and edit routes for the thesis', () => {
    configure();

    const fixture = TestBed.createComponent(ThesisCard);
    fixture.componentRef.setInput('thesis', sampleThesis);
    fixture.componentRef.setInput('canManage', true);
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('a')
    ).map((link) => link.getAttribute('href'));

    expect(links).toContain(`/theses/${sampleThesis._id}`);
    expect(links).toContain(`/theses/${sampleThesis._id}/edit`);
  });

  it('hides the manage actions unless canManage is true', () => {
    configure();

    const fixture = TestBed.createComponent(ThesisCard);
    fixture.componentRef.setInput('thesis', sampleThesis);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('button.btn--danger')).toBeNull();
  });

  it('shows the manage actions when canManage is true', () => {
    configure();

    const fixture = TestBed.createComponent(ThesisCard);
    fixture.componentRef.setInput('thesis', sampleThesis);
    fixture.componentRef.setInput('canManage', true);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('button.btn--danger')
    ).not.toBeNull();
  });

  it('emits the remove output with the thesis when delete is clicked', () => {
    configure();

    const fixture = TestBed.createComponent(ThesisCard);
    fixture.componentRef.setInput('thesis', sampleThesis);
    fixture.componentRef.setInput('canManage', true);
    fixture.detectChanges();

    const emitted: Thesis[] = [];
    fixture.componentInstance.remove.subscribe((thesis) => emitted.push(thesis));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button.btn--danger')
      ?.click();

    expect(emitted).toEqual([sampleThesis]);
  });

  it('does not emit remove while busy', () => {
    configure();

    const fixture = TestBed.createComponent(ThesisCard);
    fixture.componentRef.setInput('thesis', sampleThesis);
    fixture.componentRef.setInput('canManage', true);
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();

    const emitted: Thesis[] = [];
    fixture.componentInstance.remove.subscribe((thesis) => emitted.push(thesis));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button.btn--danger')
      ?.click();

    expect(emitted.length).toBe(0);
  });
});
