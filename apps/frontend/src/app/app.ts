import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommandInputComponent } from './components/command-input/command-input.component';

@Component({
  imports: [RouterModule, CommandInputComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'frontend';

  onCommandSubmit(command: string): void {
    console.log('コマンド送信:', command);
  }
}
