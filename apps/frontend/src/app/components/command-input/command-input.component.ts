import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-command-input',
  standalone: true,
  imports: [FormsModule, InputTextModule],
  template: `
    <div class="w-full">
      <input
        pInputText
        type="text"
        [ngModel]="inputValue()"
        (ngModelChange)="inputValue.set($event)"
        (keydown)="onKeyDown($event)"
        placeholder="コマンドを入力..."
        class="w-full font-mono"
      />
    </div>
  `,
})
export class CommandInputComponent {
  inputValue = signal('');
  commandSubmit = output<string>();

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const command = this.inputValue().trim();
      if (command) {
        this.commandSubmit.emit(command);
        this.inputValue.set('');
        // DOM要素も明示的にクリア
        const target = event.target as HTMLInputElement;
        if (target) {
          target.value = '';
        }
      }
    }
  }
}