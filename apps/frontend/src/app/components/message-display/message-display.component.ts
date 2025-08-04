import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Message {
  type: 'command' | 'output';
  content: string;
}

@Component({
  selector: 'app-message-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="font-mono p-4">
      @for (message of messages(); track $index) {
        <div 
          class="message mb-2 whitespace-pre-wrap"
          [ngClass]="{
            'message-command text-blue-600 font-bold': message.type === 'command',
            'message-output text-gray-700': message.type === 'output'
          }"
        >
          {{ message.content }}
        </div>
      }
    </div>
  `
})
export class MessageDisplayComponent {
  messages = input<Message[]>([]);
}