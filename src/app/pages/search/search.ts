import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-search',
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search {
  protected readonly results = [
    {
      title: 'Ranking Models for Sparse and Dense Retrieval',
      author: 'A. Novak',
      meta: '2025 · University of Zagreb · Information Retrieval',
      abstract:
        'Compares lexical and neural ranking signals on a domain-specific corpus, with an emphasis on hybrid scoring.',
    },
    {
      title: 'Index Compression Techniques for Small Corpora',
      author: 'M. Petrović',
      meta: '2024 · Faculty of Electrical Engineering · Indexing',
      abstract:
        'Evaluates dictionary and postings compression schemes under limited memory budgets.',
    },
    {
      title: 'Query Understanding in Domain Search Engines',
      author: 'L. Horvat',
      meta: '2024 · University of Split · Query Processing',
      abstract:
        'Analyses spelling correction, intent classification, and query expansion for narrow domains.',
    },
    {
      title: 'Evaluation Metrics for Vertical Search',
      author: 'I. Kovač',
      meta: '2023 · University of Rijeka · Evaluation',
      abstract:
        'Reviews precision, recall, and graded relevance measures and their sensitivity in small result sets.',
    },
  ];
}
