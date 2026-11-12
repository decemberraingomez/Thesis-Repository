export type ThesisCategory =
  | 'Artificial Intelligence'
  | 'Data Science'
  | 'Software Engineering'
  | 'Network & Security'
  | 'Web & Mobile Development';

export type ThesisStatus = 'Under Review' | 'Approved' | 'Published' | 'Archived';

export interface Thesis {
  _id?: string;
  title: string;              // String field
  abstract: string;           // String field
  authors: string[];          // Array of Strings
  adviser: string;            // String field
  year: number;               // Number field
  category: ThesisCategory;   // Category field (Union Type)
  status: ThesisStatus;       // Status field (Union Type)
  defenseDate: string | Date; // Date field
  createdAt?: string | Date;
  updatedAt?: string | Date;
}