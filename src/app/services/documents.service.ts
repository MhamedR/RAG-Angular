import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private baseUrl = `${environment.apiUrl}/api/documents`;
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadDocument(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    // Add to local list with 'uploading' status
    const newDoc: Document = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploading',
      progress: 0
    };

    const currentDocs = this.documentsSubject.value;
    this.documentsSubject.next([...currentDocs, newDoc]);

    return this.http.request(req);
  }

  updateDocumentStatus(document: Document, status: 'uploading' | 'processing' | 'indexed' | 'failed', progress?: number): void {
    const docs = this.documentsSubject.value;
    const index = docs.findIndex(d => d.name === document.name && d.size === document.size);

    if (index !== -1) {
      const updatedDocs = [...docs];
      updatedDocs[index] = {
        ...docs[index],
        status,
        progress: progress !== undefined ? progress : docs[index].progress
      };
      this.documentsSubject.next(updatedDocs);
    }
  }

  getDocuments(): Observable<Document[]> {
    return this.documents$;
  }
}