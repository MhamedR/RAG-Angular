import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../../../../src/app/services/chat.service';
import { ChatMessage } from '../../../../src/app/models/chat-message.model';
import { NotificationService } from '../../../../src/app/services/notification.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.chatService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = !!this.messages.find(m => m.isLoading);
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
        this.notificationService.error('Failed to load messages');
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    try {
      this.chatService.sendMessage(this.newMessage.trim());
      this.newMessage = '';
    } catch (error) {
      console.error('Error sending message:', error);
      this.notificationService.error('Failed to send message');
    }
  }

  clearChat(): void {
    this.chatService.clearMessages();
    this.notificationService.info('Chat cleared');
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
