import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Subscription } from 'rxjs';
import { TerminalWebSocketService } from '../../services/terminal-websocket.service';
import '@xterm/xterm/css/xterm.css';

@Component({
  selector: 'app-terminal',
  standalone: true,
  template: `
    <div class="terminal-container">
      <div #terminalContainer class="terminal-element"></div>
    </div>
  `,
  styles: [
    `
      .terminal-container {
        width: 100%;
        height: 100%;
        background-color: #1a1a1a;
        padding: 8px;
      }

      .terminal-element {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class TerminalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalContainer', { static: false })
  terminalContainer!: ElementRef<HTMLDivElement>;

  terminal!: Terminal;
  private fitAddon!: FitAddon;
  private terminalWebSocketService = inject(TerminalWebSocketService);
  private outputSubscription?: Subscription;

  async ngOnInit(): Promise<void> {
    // ターミナルインスタンスの作成
    this.terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#e5e5e5',
        cursor: '#f97316',
      },
    });

    // FitAddonの初期化
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    // WebSocket接続
    await this.terminalWebSocketService.connect('ws://localhost:3001');

    // PTY出力の購読
    this.outputSubscription = this.terminalWebSocketService
      .onPtyOutput()
      .subscribe((output) => {
        this.terminal.write(output);
      });

    // キー入力のハンドリング
    this.terminal.onData((data) => {
      this.terminalWebSocketService.sendCommand(data);
    });
  }

  ngAfterViewInit(): void {
    // DOMにターミナルをアタッチ
    if (this.terminalContainer && this.terminalContainer.nativeElement) {
      this.terminal.open(this.terminalContainer.nativeElement);
      this.fitAddon.fit();

      // ターミナルサイズの送信
      this.terminalWebSocketService.resize(
        this.terminal.cols,
        this.terminal.rows
      );

      // リサイズイベントのハンドリング
      const resizeObserver = new ResizeObserver(() => {
        this.fitAddon.fit();
        this.terminalWebSocketService.resize(
          this.terminal.cols,
          this.terminal.rows
        );
      });
      resizeObserver.observe(this.terminalContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.outputSubscription?.unsubscribe();
    this.terminalWebSocketService.disconnect();
    
    if (this.terminal) {
      this.terminal.dispose();
    }
  }
}