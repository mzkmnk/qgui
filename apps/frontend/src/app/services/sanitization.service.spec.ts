import { TestBed } from '@angular/core/testing';
import { SanitizationService } from './sanitization.service';

describe('SanitizationService', () => {
  let service: SanitizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SanitizationService],
    });
    service = TestBed.inject(SanitizationService);
  });

  it('サービスが作成される', () => {
    expect(service).toBeTruthy();
  });

  describe('sanitizeInput', () => {
    it('HTMLタグを除去する', () => {
      const inputs = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        '<div onclick="alert(1)">test</div>',
        '<iframe src="evil.com"></iframe>',
        '<a href="javascript:alert(1)">click</a>',
      ];

      inputs.forEach((input) => {
        const result = service.sanitizeInput(input);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('onerror=');
        expect(result).not.toContain('onclick=');
        expect(result).not.toContain('<iframe');
        expect(result).not.toContain('javascript:');
      });
    });

    it('正常なテキストはそのまま返す', () => {
      const normalInputs = [
        'ls -la',
        'git status',
        'npm install',
        'echo "Hello World"',
        'cd /home/user',
      ];

      normalInputs.forEach((input) => {
        expect(service.sanitizeInput(input)).toBe(input);
      });
    });

    it('HTMLエンティティをエスケープする', () => {
      const result = service.sanitizeInput('<>&"\'');
      expect(result).toBe('&lt;&gt;&amp;&quot;&#x27;');
    });

    it('JavaScriptイベントハンドラを除去する', () => {
      const inputs = [
        'onload="alert(1)"',
        'onmouseover="alert(1)"',
        'onfocus="alert(1)"',
        'onblur="alert(1)"',
      ];

      inputs.forEach((input) => {
        const result = service.sanitizeInput(input);
        expect(result).not.toContain('onload=');
        expect(result).not.toContain('onmouseover=');
        expect(result).not.toContain('onfocus=');
        expect(result).not.toContain('onblur=');
      });
    });

    it('nullやundefinedは空文字列を返す', () => {
      expect(service.sanitizeInput(null as unknown as string)).toBe('');
      expect(service.sanitizeInput(undefined as unknown as string)).toBe('');
    });
  });

  describe('sanitizeOutput', () => {
    it('ANSIエスケープコードは保持する', () => {
      const ansiText = '\x1b[31mRed Text\x1b[0m';
      expect(service.sanitizeOutput(ansiText)).toBe(ansiText);
    });

    it('HTMLタグをエスケープする', () => {
      const output = 'Command output: <div>test</div>';
      const result = service.sanitizeOutput(output);
      expect(result).toBe('Command output: &lt;div&gt;test&lt;/div&gt;');
    });

    it('JavaScriptコードをエスケープする', () => {
      const output = '<script>alert("xss")</script>';
      const result = service.sanitizeOutput(output);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('isValidCommand', () => {
    it('有効なコマンドを判定する', () => {
      const validCommands = [
        'ls',
        'pwd',
        'git status',
        'npm install',
        'echo test',
      ];

      validCommands.forEach((cmd) => {
        expect(service.isValidCommand(cmd)).toBe(true);
      });
    });

    it('インジェクション攻撃を検出する', () => {
      const injections = [
        'ls; rm -rf /',
        'echo test && rm -rf ~',
        'cat file | rm -rf .',
        '`rm -rf /`',
        '$(rm -rf /)',
      ];

      injections.forEach((cmd) => {
        expect(service.isValidCommand(cmd)).toBe(false);
      });
    });

    it('空文字列は無効とする', () => {
      expect(service.isValidCommand('')).toBe(false);
      expect(service.isValidCommand('   ')).toBe(false);
    });
  });
});