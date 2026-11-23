/**
 * Author: Andrada, Jim Magnus C.
 * Co-author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'theses',
    loadComponent: () => import('./pages/theses-list/theses-list').then((m) => m.ThesesList),
  },
  {
    path: 'theses/new',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/thesis-form/thesis-form').then((m) => m.ThesisForm),
  },
  {
    path: 'theses/:id/edit',
    canActivate: [adminGuard],
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
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
