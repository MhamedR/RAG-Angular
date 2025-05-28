import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RagQuery, RagResponse } from '../models/rag-query.model';

@Injectable({
  providedIn: 'root'
})
export class RagService {
  private baseUrl = `${environment.apiUrl}/api/rag`;

  constructor(private http: HttpClient) {}

  indexDocument(documentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/index`, { documentId });
  }

  query(query: RagQuery): Observable<RagResponse> {
    return this.http.get<RagResponse>(`${this.baseUrl}/query`, {
      params: { query: query.query, ...query.filters }
    });
  }
}