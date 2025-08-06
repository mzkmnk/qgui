// ターミナル用のWebSocketメッセージ型定義
export interface TerminalMessage {
  type: 'pty:start' | 'pty:stop' | 'pty:input' | 'pty:output' | 'pty:resize' | 'pty:error';
  data: any;
}

export interface PtyStartMessage extends TerminalMessage {
  type: 'pty:start';
  data: Record<string, any>;
}

export interface PtyStopMessage extends TerminalMessage {
  type: 'pty:stop';
  data: Record<string, any>;
}

export interface PtyInputMessage extends TerminalMessage {
  type: 'pty:input';
  data: string;
}

export interface PtyOutputMessage extends TerminalMessage {
  type: 'pty:output';
  data: string;
}

export interface PtyResizeMessage extends TerminalMessage {
  type: 'pty:resize';
  data: {
    cols: number;
    rows: number;
  };
}

export interface PtyErrorMessage extends TerminalMessage {
  type: 'pty:error';
  data: {
    message: string;
    code?: string;
  };
}