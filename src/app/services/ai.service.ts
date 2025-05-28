import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private baseUrl = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  getCompletion(prompt: string): Observable<any> {
    return this.http.get(this.baseUrl, {
      params: { prompt },
      responseType: 'text',
      reportProgress: true,
      observe: 'events'
    });
  }
} 