import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SanitizationService {
  private readonly htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  private readonly dangerousPatterns = [
    // HTMLタグ
    /<[^>]*>/g,
    // JavaScriptイベントハンドラ
    /on\w+\s*=/gi,
    // javascript: プロトコル
    /javascript:/gi,
    // data: プロトコル（base64エンコードされたスクリプトを防ぐ）
    /data:text\/html/gi,
  ];

  private readonly commandInjectionPatterns = [
    // コマンドチェーン
    /[;&|]/,
    // コマンド置換
    /\$\(/,
    /`/,
    // リダイレクト
    />|</,
  ];

  /**
   * ユーザー入力をサニタイズする
   */
  sanitizeInput(input: string): string {
    if (!input) {
      return '';
    }

    let sanitized = input;

    // HTMLタグやスクリプトが含まれている場合のみエスケープ
    const hasHtmlOrScript = /<[^>]*>/.test(input) || 
                           /on\w+\s*=/i.test(input) || 
                           /javascript:/i.test(input);

    if (hasHtmlOrScript) {
      // HTMLエンティティをエスケープ
      sanitized = this.escapeHtml(sanitized);

      // 危険なパターンを除去
      this.dangerousPatterns.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, '');
      });
    }

    return sanitized;
  }

  /**
   * コマンド出力をサニタイズする（ANSIコードは保持）
   */
  sanitizeOutput(output: string): string {
    if (!output) {
      return '';
    }

    // ANSIエスケープコードを一時的に保護
    // eslint-disable-next-line no-control-regex
    const ansiPattern = /\x1b\[[0-9;]*m/g;
    const ansiCodes: string[] = [];
    let index = 0;

    // ANSIコードを抽出して一時的なプレースホルダーに置き換え
    let temp = output.replace(ansiPattern, (match) => {
      ansiCodes.push(match);
      return `__ANSI_${index++}__`;
    });

    // HTMLをエスケープ
    temp = this.escapeHtml(temp);

    // ANSIコードを復元
    ansiCodes.forEach((code, i) => {
      temp = temp.replace(`__ANSI_${i}__`, code);
    });

    return temp;
  }

  /**
   * コマンドが有効かどうかを判定する
   */
  isValidCommand(command: string): boolean {
    if (!command || !command.trim()) {
      return false;
    }

    // コマンドインジェクションパターンをチェック
    for (const pattern of this.commandInjectionPatterns) {
      if (pattern.test(command)) {
        return false;
      }
    }

    // rm -rf系の危険なコマンドをチェック
    if (command.includes('rm -rf')) {
      return false;
    }

    return true;
  }

  /**
   * HTMLをエスケープする
   */
  private escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (char) => this.htmlEntities[char] || char);
  }
}