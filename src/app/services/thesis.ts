/**
 * Author: December Rain Gomez
 * Date: November 17, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Thesis } from '../models/thesis.model';

@Injectable({ providedIn: 'root' })
export class ThesisService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/theses';

  private thesesSignal = signal<Thesis[]>([]);
  theses = this.thesesSignal.asReadonly();

  fetchTheses() {
    this.http.get<Thesis[]>(this.apiUrl).subscribe((data) => this.thesesSignal.set(data));
  }

  getThesis(id: string) {
    return this.http.get<Thesis>(`${this.apiUrl}/${id}`);
  }

  addThesis(thesis: Thesis) {
    return this.http.post<Thesis>(this.apiUrl, thesis);
  }

  updateThesis(id: string, thesis: Thesis) {
    return this.http.put<Thesis>(`${this.apiUrl}/${id}`, thesis);
  }

  deleteThesis(id: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
