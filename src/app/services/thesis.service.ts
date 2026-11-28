/**
 * Author: Jezreel M. Onos
 * Date: November 25, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Thesis } from '../models/thesis.model';

const LOCAL_API_BASE_URL = 'http://localhost:3000/api';
const PRODUCTION_API_BASE_URL = 'https://thesis-repository.onrender.com/api';

const PRODUCTION_HOSTNAMES = ['thesis-repository.vercel.app'];
const PRODUCTION_HOSTNAME_SUFFIXES = ['.vercel.app'];

const isProductionHostname = (hostname: string): boolean =>
  PRODUCTION_HOSTNAMES.includes(hostname) ||
  PRODUCTION_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix));

export const resolveApiBaseUrl = (hostname?: string): string => {
  if (typeof window === 'undefined') {
    return LOCAL_API_BASE_URL;
  }

  const resolvedHostname = hostname ?? window.location.hostname;

  return isProductionHostname(resolvedHostname) ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();

export interface ThesisInput {
  title: string;
  abstract: string;
  authors: string[];
  adviser: string;
  year: number;
  category: Thesis['category'];
  status: Thesis['status'];
  defenseDate: string;
}

export interface ApiErrorBody {
  message?: string;
  errors?: string[];
}

export type ThesisSort = 'newest' | 'oldest' | 'title' | 'year';

export interface ThesisQuery {
  search?: string;
  category?: string;
  status?: string;
  year?: number;
  sort?: ThesisSort;
}

@Injectable({ providedIn: 'root' })
export class ThesisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/theses`;

  getTheses(query: ThesisQuery = {}): Observable<Thesis[]> {
    return this.http.get<Thesis[]>(this.baseUrl, { params: this.buildParams(query) });
  }

  private buildParams(query: ThesisQuery): Record<string, string> {
    const params: Record<string, string> = {};

    if (query.search?.trim()) {
      params['search'] = query.search.trim();
    }

    if (query.category) {
      params['category'] = query.category;
    }

    if (query.status) {
      params['status'] = query.status;
    }

    if (query.year) {
      params['year'] = String(query.year);
    }

    if (query.sort) {
      params['sort'] = query.sort;
    }

    return params;
  }

  getThesis(id: string): Observable<Thesis> {
    return this.http.get<Thesis>(`${this.baseUrl}/${id}`);
  }

  createThesis(payload: ThesisInput): Observable<Thesis> {
    return this.http.post<Thesis>(this.baseUrl, payload);
  }

  updateThesis(id: string, payload: ThesisInput): Observable<Thesis> {
    return this.http.put<Thesis>(`${this.baseUrl}/${id}`, payload);
  }

  deleteThesis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot reach the thesis API. Make sure the Express server is running on port 3000.';
      }

      const body = error.error;
      if (this.isApiErrorBody(body)) {
        if (body.errors && body.errors.length > 0) {
          return [body.message ?? 'Validation failed', ...body.errors].join(' ');
        }

        if (body.message) {
          return body.message;
        }
      }

      if (error.status === 404) {
        return 'The requested thesis record could not be found.';
      }

      return `The server returned an unexpected error (HTTP ${error.status}).`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private isApiErrorBody(value: unknown): value is ApiErrorBody {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;
    const validMessage =
      candidate['message'] === undefined || typeof candidate['message'] === 'string';
    const validErrors =
      candidate['errors'] === undefined ||
      (Array.isArray(candidate['errors']) &&
        candidate['errors'].every((item) => typeof item === 'string'));

    return validMessage && validErrors;
  }
}
