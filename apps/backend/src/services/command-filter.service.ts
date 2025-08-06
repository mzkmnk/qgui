import { Injectable } from '@nestjs/common';

@Injectable()
export class CommandFilterService {
  private readonly dangerousPatterns: RegExp[] = [
    // ファイルシステム破壊系
    /rm\s+-rf\s+\//,
    /rm\s+-rf\s+~/,
    /rm\s+-rf\s+\./,
    /rm\s+-rf\s+\*/,
    /sudo\s+rm/,
    /mkfs/,
    /dd\s+.*of=\/dev/,

    // 権限変更系
    /chmod\s+-R\s+777/,
    /chmod\s+777/,
    /chown\s+-R\s+root/,

    // sudo実行
    /^sudo\s+/,
    /\s+sudo\s+/,

    // fork bomb
    /:\(\)\{.*\|.*&.*\};:/,

    // ファイルシステム操作
    /fdisk/,
    /parted/,
    /mount\s+\/dev/,
    /umount/,

    // その他危険なコマンド
    /shutdown/,
    /reboot/,
    /init\s+0/,
    /systemctl\s+stop/,
  ];

  /**
   * コマンドが安全かどうかを判定する
   */
  isSafe(command: string): boolean {
    // 空文字列やnull/undefinedは安全とみなす
    if (!command) {
      return true;
    }

    // 危険なパターンに一致するかチェック
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(command)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 危険なコマンドを無害化する
   */
  sanitize(command: string): string {
    if (!this.isSafe(command)) {
      return '# Dangerous command blocked';
    }
    return command;
  }
}