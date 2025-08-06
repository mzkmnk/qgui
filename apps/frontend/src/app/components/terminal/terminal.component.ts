import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

@Component({
  selector: 'app-terminal',
  standalone: true,
  template: `
    <div class="terminal-container">
      <div #terminalContainer class="terminal-element"></div>
    </div>
  `,
  styles: [`
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
  `],
})
export class TerminalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalContainer', { static: false }) terminalContainer!: ElementRef<HTMLDivElement>;
  
  terminal!: Terminal;
  private fitAddon!: FitAddon;

  ngOnInit(): void {
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
  }

  ngAfterViewInit(): void {
    // DOMにターミナルをアタッチ
    if (this.terminalContainer && this.terminalContainer.nativeElement) {
      this.terminal.open(this.terminalContainer.nativeElement);
      this.fitAddon.fit();
      
      // テスト用のウェルカムメッセージ
      this.terminal.writeln('ターミナル初期化完了');
    }
  }

  ngOnDestroy(): void {
    if (this.terminal) {
      this.terminal.dispose();
    }
  }
}