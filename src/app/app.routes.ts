/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'theses',
    loadComponent: () => import('./pages/theses-list/theses-list').then((m) => m.ThesesList),
  },
  {
    path: 'theses/new',
    loadComponent: () => import('./pages/thesis-form/thesis-form').then((m) => m.ThesisForm),
  },
  {
    path: 'theses/:id/edit',
    loadComponent: () => import('./pages/thesis-form/thesis-form').then((m) => m.ThesisForm),
  },
  {
    path: 'theses/:id',
    loadComponent: () => import('./pages/thesis-detail/thesis-detail').then((m) => m.ThesisDetail),
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then((m) => m.Search),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  { path: '**', redirectTo: '' },
];
