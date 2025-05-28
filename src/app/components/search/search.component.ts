import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { RagService } from '../../services/rag.service';
import { NotificationService } from '../../services/notification.service';
import { RagQuery, RagResponse, RagDocument } from '../../models/rag-query.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  query: string = '';
  isLoading: boolean = false;
  response: RagResponse | null = null;

  constructor(
    private ragService: RagService,
    private notificationService: NotificationService
  ) {}

  search(): void {
    if (!this.query.trim()) {
      return;
    }

    this.isLoading = true;
    this.response = null;

    const ragQuery: RagQuery = {
      query: this.query.trim()
    };

    this.ragService.query(ragQuery).subscribe({
      next: (response) => {
        this.response = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.notificationService.error('Failed to get search results');
        this.isLoading = false;
      }
    });
  }

  clearSearch(): void {
    this.query = '';
    this.response = null;
  }

  getRelevancePercentage(relevance: number): number {
    return Math.round(relevance * 100);
  }
}
