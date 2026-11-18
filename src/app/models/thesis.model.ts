/**
 * Author: Jezreel M. Onos
 * Date: November 18, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

export type ThesisCategory =
  | 'Artificial Intelligence'
  | 'Data Science'
  | 'Software Engineering'
  | 'Network & Security'
  | 'Web & Mobile Development';

export type ThesisStatus = 'Under Review' | 'Approved' | 'Published' | 'Archived';

export const THESIS_CATEGORIES: ThesisCategory[] = [
  'Artificial Intelligence',
  'Data Science',
  'Software Engineering',
  'Network & Security',
  'Web & Mobile Development',
];

export const THESIS_STATUSES: ThesisStatus[] = [
  'Under Review',
  'Approved',
  'Published',
  'Archived',
];

export interface Thesis {
  _id?: string;
  title: string;
  abstract: string;
  authors: string[];
  adviser: string;
  year: number;
  category: ThesisCategory;
  status: ThesisStatus;
  defenseDate: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
