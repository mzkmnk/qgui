import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Command {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="isVisible()"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      (click)="onOverlayClick()"
      (keydown.escape)="close()"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-label="コマンドパレット"
    >
      <div
        class="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
        role="none"
      >
        <div
          class="bg-neural-darker/95 backdrop-blur-xl border border-neural-border rounded-xl shadow-2xl overflow-hidden relative"
        >
          <!-- ネオングローフレーム -->
          <div
            class="absolute inset-0 rounded-xl shadow-neon-sm opacity-50 pointer-events-none"
          ></div>
          <div class="p-5 border-b border-neural-border relative">
            <div
              class="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-neon/50 to-transparent"
            ></div>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="コマンドを検索..."
              class="w-full px-4 py-3 bg-neural-void/50 border border-neural-border rounded-lg text-neural-text placeholder-neural-muted font-mono outline-none transition-all duration-300 focus:border-accent-neon focus:shadow-inner-glow focus:bg-neural-void/80"
            />
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div *ngFor="let command of getFilteredCommands(); let i = index">
              <button
                (click)="executeCommand(command)"
                (keydown.enter)="executeCommand(command)"
                (keydown.space)="executeCommand(command)"
                (mouseenter)="selectedIndex = i"
                tabindex="0"
                role="menuitem"
                class="w-full px-5 py-4 flex items-center justify-between hover:bg-neural-surface transition-all duration-300 relative overflow-hidden group"
                [ngClass]="{
                  'bg-neural-surface border-l-2 border-accent-neon':
                    selectedIndex === i
                }"
              >
                <!-- ホバーグロー -->
                <div
                  class="absolute inset-0 bg-gradient-to-r from-accent-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                ></div>
                <div class="flex items-center gap-3 relative z-10">
                  <span
                    *ngIf="command.icon"
                    class="text-neural-subtle transition-colors duration-300 group-hover:text-accent-neon"
                    >{{ command.icon }}</span
                  >
                  <span
                    class="text-neural-text font-medium transition-colors duration-300 group-hover:text-neural-bright"
                    >{{ command.label }}</span
                  >
                </div>
                <span
                  *ngIf="command.shortcut"
                  class="text-xs text-neural-muted bg-neural-void/50 px-3 py-1.5 rounded-lg border border-neural-border font-mono relative z-10"
                >
                  {{ command.shortcut }}
                </span>
              </button>
            </div>
            <div
              *ngIf="getFilteredCommands().length === 0"
              class="px-5 py-10 text-center text-neural-muted"
            >
              コマンドが見つかりません
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CommandPaletteComponent {
  isVisible = signal(false);
  searchQuery = '';
  selectedIndex = 0;

  commands: Command[] = [
    {
      id: 'new-chat',
      label: '新しいチャット',
      icon: '➕',
      shortcut: 'Cmd+N',
      action: () => console.log('New chat'),
    },
    {
      id: 'clear-chat',
      label: 'チャットをクリア',
      icon: '🗑️',
      shortcut: 'Cmd+L',
      action: () => console.log('Clear chat'),
    },
    {
      id: 'toggle-sidebar',
      label: 'サイドバー切り替え',
      icon: '📁',
      shortcut: 'Cmd+B',
      action: () => console.log('Toggle sidebar'),
    },
    {
      id: 'settings',
      label: '設定',
      icon: '⚙️',
      shortcut: 'Cmd+,',
      action: () => console.log('Open settings'),
    },
    {
      id: 'help',
      label: 'ヘルプ',
      icon: '❓',
      shortcut: 'Cmd+/',
      action: () => console.log('Show help'),
    },
  ];

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }

    if (event.key === 'Escape' && this.isVisible()) {
      event.preventDefault();
      this.close();
    }

    if (this.isVisible()) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedIndex = Math.min(
          this.selectedIndex + 1,
          this.getFilteredCommands().length - 1
        );
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const commands = this.getFilteredCommands();
        if (commands[this.selectedIndex]) {
          this.executeCommand(commands[this.selectedIndex]);
        }
      }
    }
  }

  open(): void {
    this.isVisible.set(true);
    this.searchQuery = '';
    this.selectedIndex = 0;
  }

  close(): void {
    this.isVisible.set(false);
  }

  toggle(): void {
    if (this.isVisible()) {
      this.close();
    } else {
      this.open();
    }
  }

  onOverlayClick(): void {
    this.close();
  }

  onSearchChange(): void {
    this.selectedIndex = 0;
  }

  getFilteredCommands(): Command[] {
    if (!this.searchQuery) {
      return this.commands;
    }

    const query = this.searchQuery.toLowerCase();
    return this.commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(query)
    );
  }

  executeCommand(command: Command): void {
    command.action();
    this.close();
  }
}
