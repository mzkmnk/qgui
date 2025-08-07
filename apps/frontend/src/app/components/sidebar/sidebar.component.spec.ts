import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成される', () => {
    expect(component).toBeTruthy();
  });

  it('初期セッションが表示される', () => {
    expect(component.sessions().length).toBeGreaterThan(0);
    expect(component.filteredSessions().length).toBe(component.sessions().length);
  });

  it('新しいチャットを作成できる', () => {
    const initialCount = component.sessions().length;
    let emitted = false;
    
    component.newChatCreated.subscribe(() => {
      emitted = true;
    });
    
    component.createNewChat();
    
    expect(component.sessions().length).toBe(initialCount + 1);
    expect(component.sessions()[0].title).toBe('新しいチャット');
    expect(component.sessions()[0].isActive).toBe(true);
    expect(emitted).toBe(true);
  });

  it('セッションを選択できる', () => {
    const session = component.sessions()[1];
    let selectedSession: any = null;
    
    component.sessionSelected.subscribe((s) => {
      selectedSession = s;
    });
    
    component.selectSession(session);
    
    const updatedSession = component.sessions().find(s => s.id === session.id);
    expect(updatedSession?.isActive).toBe(true);
    expect(selectedSession).toBe(session);
  });

  it('セッションを削除できる', () => {
    const initialCount = component.sessions().length;
    const sessionToDelete = component.sessions()[0];
    const mockEvent = new Event('click');
    
    component.deleteSession(sessionToDelete, mockEvent);
    
    expect(component.sessions().length).toBe(initialCount - 1);
    expect(component.sessions().find(s => s.id === sessionToDelete.id)).toBeUndefined();
  });

  it('セッションを検索できる', () => {
    component.searchQuery = 'TypeScript';
    component.filterSessions();
    
    const filtered = component.filteredSessions();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].title).toContain('TypeScript');
  });

  it('今日のセッションを取得できる', () => {
    const todaySessions = component.getTodaySessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    todaySessions.forEach(session => {
      expect(session.timestamp >= today).toBe(true);
    });
  });

  it('昨日のセッションを取得できる', () => {
    const yesterdaySessions = component.getYesterdaySessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    yesterdaySessions.forEach(session => {
      expect(session.timestamp >= yesterday).toBe(true);
      expect(session.timestamp < today).toBe(true);
    });
  });

  it('日付をフォーマットできる', () => {
    const date = new Date('2025-01-15');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('1月');
    expect(formatted).toContain('15');
  });
});