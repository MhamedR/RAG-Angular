import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ChatMessage } from '../models/chat-message.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiKey: string | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.authService.apiKey$.subscribe(apiKey => {
      this.apiKey = apiKey;
    });
  }

  sendMessage(content: string): void {
    console.log('Sending message:', content);
    if (!this.apiKey) {
      console.error('API key not available');
      return;
    }

    // Add user message to local list
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      timestamp: new Date(),
      isUser: true
    };

    this.addMessage(userMessage);

    // Add a temporary loading message
    const loadingMessageId = uuidv4();
    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      content: '',
      timestamp: new Date(),
      isUser: false,
      isLoading: true
    };

    this.addMessage(loadingMessage);

    // Use fetch with proper headers for streaming response
    const responseMessageId = uuidv4();

    fetch(`${environment.apiUrl}/api/ai?prompt=${encodeURIComponent(content)}`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey || ''
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      // Function to process stream chunks
      const processStream = async () => {
        let done = false;
        let fullContent = '';

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (done) {
            // Stream is complete, update with final message
            const finalMessage: ChatMessage = {
              id: responseMessageId,
              content: fullContent,
              timestamp: new Date(),
              isUser: false
            };
            this.replaceLoadingMessage(loadingMessageId, finalMessage);
            break;
          }

          // Convert the Uint8Array to a string
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          // Process each line (SSE format: "data: {...}")
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const jsonStr = line.substring(5).trim();
                const data = JSON.parse(jsonStr);

                if (data.text) {
                  fullContent += data.text;
                  // Don't update the UI with each chunk
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, line);
              }
            }
          }
        }
      };

      processStream().catch(error => {
        console.error('Error processing stream:', error);
        const errorMessage: ChatMessage = {
          id: responseMessageId,
          content: 'Sorry, there was an error processing your request.',
          timestamp: new Date(),
          isUser: false
        };

        this.replaceLoadingMessage(loadingMessageId, errorMessage);
      });
    })
    .catch(error => {
      console.error('Fetch error:', error);
      const errorMessage: ChatMessage = {
        id: responseMessageId,
        content: 'Sorry, there was an error connecting to the chat service.',
        timestamp: new Date(),
        isUser: false
      };

      this.replaceLoadingMessage(loadingMessageId, errorMessage);
    });
  }

  private replaceLoadingMessage(loadingId: string, newMessage: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    const loadingIndex = currentMessages.findIndex(m => m.id === loadingId);

    if (loadingIndex !== -1) {
      const updatedMessages = [...currentMessages];
      updatedMessages.splice(loadingIndex, 1, newMessage);
      this.messagesSubject.next(updatedMessages);
    } else {
      this.addMessage(newMessage);
    }
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  getMessages(): Observable<ChatMessage[]> {
    return this.messages$;
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}