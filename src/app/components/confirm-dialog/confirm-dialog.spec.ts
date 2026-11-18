/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('renders only while open and emits confirmed when accepted', () => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.dialog')).toBeNull();

    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Delete thesis?');
    fixture.componentRef.setInput('message', 'This removes the record.');
    fixture.detectChanges();

    let confirmed = 0;
    fixture.componentInstance.confirmed.subscribe(() => {
      confirmed += 1;
    });

    const dialog = host.querySelector('.dialog');
    expect(dialog).not.toBeNull();

    const buttons = host.querySelectorAll<HTMLButtonElement>('.dialog__button');
    expect(buttons.length).toBe(2);

    buttons[1].click();
    fixture.detectChanges();

    expect(confirmed).toBe(1);
  });

  it('emits cancelled and disables actions while busy', () => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();

    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => {
      cancelled += 1;
    });

    const host = fixture.nativeElement as HTMLElement;
    const buttons = host.querySelectorAll<HTMLButtonElement>('.dialog__button');

    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
    expect(host.querySelector('.dialog')?.classList.contains('dialog--busy')).toBe(true);

    buttons[0].click();
    expect(cancelled).toBe(0);
  });
});
