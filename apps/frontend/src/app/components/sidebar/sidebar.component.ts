import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col relative overflow-hidden">
      <!-- グラデーション装飾 -->
      <div class="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none"></div>
      
      <!-- ヘッダー -->
      <div class="p-4 border-b border-zinc-800 relative">
        <button 
          (click)="createNewChat()"
          class="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          新しいチャット
        </button>
      </div>
      
      <!-- 検索バー -->
      <div class="p-4 border-b border-zinc-800">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="filterSessions()"
          placeholder="チャットを検索..."
          class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-orange-500 focus:shadow-[0_0_0_1px_rgba(249,115,22,0.2)]"
        />
      </div>
      
      <!-- チャットリスト -->
      <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <!-- 今日 -->
        <div *ngIf="getTodaySessions().length > 0" class="px-4 py-2">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">今日</h3>
          <div class="mt-2 space-y-1">
            <div *ngFor="let session of getTodaySessions()"
                 (click)="selectSession(session)"
                 class="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-zinc-800 group cursor-pointer"
                 [ngClass]="{'bg-zinc-800 border border-orange-500/30': session.isActive}">
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-200 truncate">{{ session.title }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ session.preview }}</div>
                </div>
                <button 
                  (click)="deleteSession(session, $event)"
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 昨日 -->
        <div *ngIf="getYesterdaySessions().length > 0" class="px-4 py-2 mt-2">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">昨日</h3>
          <div class="mt-2 space-y-1">
            <div *ngFor="let session of getYesterdaySessions()"
                 (click)="selectSession(session)"
                 class="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-zinc-800 group cursor-pointer"
                 [ngClass]="{'bg-zinc-800 border border-orange-500/30': session.isActive}">
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-200 truncate">{{ session.title }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ session.preview }}</div>
                </div>
                <button 
                  (click)="deleteSession(session, $event)"
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 過去 -->
        <div *ngIf="getOlderSessions().length > 0" class="px-4 py-2 mt-2">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">過去のチャット</h3>
          <div class="mt-2 space-y-1">
            <div *ngFor="let session of getOlderSessions()"
                 (click)="selectSession(session)"
                 class="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-zinc-800 group cursor-pointer"
                 [ngClass]="{'bg-zinc-800 border border-orange-500/30': session.isActive}">
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-200 truncate">{{ session.title }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ formatDate(session.timestamp) }}</div>
                </div>
                <button 
                  (click)="deleteSession(session, $event)"
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- フッター -->
      <div class="p-4 border-t border-zinc-800">
        <div class="flex items-center gap-2">
          <button class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <button class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent {
  searchQuery = '';
  newChatCreated = output<void>();
  sessionSelected = output<ChatSession>();
  
  sessions = signal<ChatSession[]>([
    {
      id: '1',
      title: 'TypeScript質問',
      timestamp: new Date(),
      preview: 'TypeScriptの型システムについて...',
      isActive: true
    },
    {
      id: '2',
      title: 'Angular 20の新機能',
      timestamp: new Date(Date.now() - 86400000), // 昨日
      preview: 'Angular 20でのSignalsの改善点...'
    },
    {
      id: '3',
      title: 'NestJSベストプラクティス',
      timestamp: new Date(Date.now() - 172800000), // 2日前
      preview: 'NestJSでのDI実装パターン...'
    }
  ]);
  
  filteredSessions = signal<ChatSession[]>([]);
  
  constructor() {
    this.filteredSessions.set(this.sessions());
  }
  
  createNewChat(): void {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新しいチャット',
      timestamp: new Date(),
      preview: 'チャットを開始...',
      isActive: true
    };
    
    // 既存のアクティブセッションを非アクティブに
    this.sessions.update(sessions => 
      sessions.map(s => ({ ...s, isActive: false }))
    );
    
    // 新しいセッションを追加
    this.sessions.update(sessions => [newSession, ...sessions]);
    this.filterSessions();
    this.newChatCreated.emit();
  }
  
  selectSession(session: ChatSession): void {
    this.sessions.update(sessions => 
      sessions.map(s => ({
        ...s,
        isActive: s.id === session.id
      }))
    );
    this.sessionSelected.emit(session);
  }
  
  deleteSession(session: ChatSession, event: Event): void {
    event.stopPropagation();
    this.sessions.update(sessions => 
      sessions.filter(s => s.id !== session.id)
    );
    this.filterSessions();
  }
  
  filterSessions(): void {
    if (!this.searchQuery) {
      this.filteredSessions.set(this.sessions());
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredSessions.set(
        this.sessions().filter(s => 
          s.title.toLowerCase().includes(query) ||
          s.preview.toLowerCase().includes(query)
        )
      );
    }
  }
  
  getTodaySessions(): ChatSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.filteredSessions().filter(s => 
      s.timestamp >= today
    );
  }
  
  getYesterdaySessions(): ChatSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return this.filteredSessions().filter(s => 
      s.timestamp >= yesterday && s.timestamp < today
    );
  }
  
  getOlderSessions(): ChatSession[] {
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return this.filteredSessions().filter(s => 
      s.timestamp < yesterday
    );
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  trackBySessionId(index: number, session: ChatSession): string {
    return session.id;
  }
}