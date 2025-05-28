import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiKeySubject = new BehaviorSubject<string | null>(this.getStoredApiKey());
  public apiKey$ = this.apiKeySubject.asObservable();

  constructor() {}

  setApiKey(apiKey: string): void {
    localStorage.setItem('apiKey', apiKey);
    this.apiKeySubject.next(apiKey);
  }

  getApiKey(): string | null {
    return this.apiKeySubject.value;
  }

  private getStoredApiKey(): string | null {
    return localStorage.getItem('apiKey');
  }

  clearApiKey(): void {
    localStorage.removeItem('apiKey');
    this.apiKeySubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getApiKey();
  }
} 