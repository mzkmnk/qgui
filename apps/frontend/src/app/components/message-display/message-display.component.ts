import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsiPipe } from '../../pipes/ansi.pipe';

interface Message {
  type: 'command' | 'output';
  content: string;
}

@Component({
  selector: 'app-message-display',
  standalone: true,
  imports: [CommonModule, AnsiPipe],
  template: `
    <div class="font-mono p-4">
      @for (message of messages(); track $index) {
        <div 
          class="message mb-2 whitespace-pre-wrap"
          [ngClass]="{
            'message-command text-blue-600 font-bold': message.type === 'command',
            'message-output text-gray-700': message.type === 'output'
          }"
          [innerHTML]="message.content | ansi"
        >
        </div>
      }
    </div>
  `
})
export class MessageDisplayComponent {
  messages = input<Message[]>([]);
}