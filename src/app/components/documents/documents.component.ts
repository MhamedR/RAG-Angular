import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { NgxFileDropModule, NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { HttpEventType } from '@angular/common/http';
import { DocumentsService } from '../../services/documents.service';
import { NotificationService } from '../../services/notification.service';
import { RagService } from '../../services/rag.service';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTableModule,
    NgxFileDropModule
  ],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  documents: Document[] = [];
  displayedColumns: string[] = ['name', 'size', 'type', 'uploadDate', 'status', 'actions'];
  isUploading = false;

  constructor(
    private documentsService: DocumentsService,
    private ragService: RagService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.documentsService.getDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
      },
      error: (error) => {
        console.error('Error fetching documents:', error);
        this.notificationService.error('Failed to load documents');
      }
    });
  }

  dropped(files: NgxFileDropEntry[]): void {
    if (this.isUploading) {
      this.notificationService.info('Please wait for the current upload to finish');
      return;
    }

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          this.uploadFile(file);
        });
      }
    }
  }

  uploadFile(file: File): void {
    this.isUploading = true;

    this.documentsService.uploadDocument(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round(100 * (event.loaded / event.total));

          // Find document in our list
          const doc = this.documents.find(d =>
            d.name === file.name &&
            d.size === file.size &&
            d.status === 'uploading'
          );

          if (doc) {
            this.documentsService.updateDocumentStatus(doc, 'uploading', progress);
          }
        }

        if (event.type === HttpEventType.Response) {
          this.isUploading = false;

          // Find document and update status
          const doc = this.documents.find(d =>
            d.name === file.name &&
            d.size === file.size
          );

          if (doc && event.body && event.body.id) {
            const updatedDoc = { ...doc, id: event.body.id, status: 'processing' as const };
            this.documentsService.updateDocumentStatus(updatedDoc, 'processing', 100);
            this.notificationService.success('Document uploaded successfully');

            // Start indexing the document
            this.indexDocument(updatedDoc);
          }
        }
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);

        // Find document and update status
        const doc = this.documents.find(d =>
          d.name === file.name &&
          d.size === file.size
        );

        if (doc) {
          this.documentsService.updateDocumentStatus(doc, 'failed');
        }

        this.notificationService.error('Failed to upload document');
      }
    });
  }

  indexDocument(document: Document): void {
    if (!document.id) {
      this.notificationService.error('Document ID is missing');
      return;
    }

    this.ragService.indexDocument(document.id).subscribe({
      next: () => {
        this.documentsService.updateDocumentStatus(document, 'indexed');
        this.notificationService.success('Document indexed successfully');
      },
      error: (error) => {
        console.error('Indexing error:', error);
        this.documentsService.updateDocumentStatus(document, 'failed');
        this.notificationService.error('Failed to index document');
      }
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'uploading': return 'primary';
      case 'processing': return 'accent';
      case 'indexed': return 'primary';
      case 'failed': return 'warn';
      default: return '';
    }
  }
}
