import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-command-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="w-full">
      <input
        type="text"
        [ngModel]="inputValue()"
        (ngModelChange)="inputValue.set($event)"
        (keydown)="onKeyDown($event)"
        placeholder="コマンドを入力..."
        class="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  `,
  styles: [],
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