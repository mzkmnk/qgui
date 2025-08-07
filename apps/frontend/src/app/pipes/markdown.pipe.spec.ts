import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    const sanitizerMock = {
      bypassSecurityTrustHtml: vi.fn((value: string) => value),
      sanitize: vi.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        MarkdownPipe,
        { provide: DomSanitizer, useValue: sanitizerMock }
      ]
    });
    pipe = TestBed.inject(MarkdownPipe);
  });

  it('パイプインスタンスを作成できる', () => {
    expect(pipe).toBeTruthy();
  });

  it('空文字列を処理できる', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('見出しを変換できる', () => {
    const markdown = '# 見出し1\n## 見出し2\n### 見出し3';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<h1');
    expect(htmlString).toContain('<h2');
    expect(htmlString).toContain('<h3');
  });

  it('コードブロックを変換できる', () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<pre');
    expect(htmlString).toContain('<code');
  });

  it('インラインコードを変換できる', () => {
    const markdown = 'これは`インラインコード`です';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<code');
  });

  it('リストを変換できる', () => {
    const markdown = '- アイテム1\n- アイテム2\n\n1. 番号1\n2. 番号2';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<ul');
    expect(htmlString).toContain('<ol');
    expect(htmlString).toContain('<li');
  });

  it('リンクを変換できる', () => {
    const markdown = '[リンクテキスト](https://example.com)';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<a');
    expect(htmlString).toContain('href="https://example.com"');
  });

  it('太字と斜体を変換できる', () => {
    const markdown = '**太字** と *斜体*';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<strong>');
    expect(htmlString).toContain('<em>');
  });

  it('引用を変換できる', () => {
    const markdown = '> これは引用です';
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<blockquote');
  });

  it('テーブルを変換できる', () => {
    const markdown = `| ヘッダー1 | ヘッダー2 |
|----------|----------|
| セル1    | セル2    |`;
    const result = pipe.transform(markdown);
    const htmlString = result.toString();
    expect(htmlString).toContain('<table');
    expect(htmlString).toContain('<thead');
    expect(htmlString).toContain('<tbody');
  });

  it('エラー時は元のテキストを返す', () => {
    // nullを渡してエラーを発生させる
    const result = pipe.transform(null as unknown as string);
    expect(result).toBe('');
  });
});