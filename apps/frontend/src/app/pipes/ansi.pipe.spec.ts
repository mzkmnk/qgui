import { AnsiPipe } from './ansi.pipe';
import { TestBed } from '@angular/core/testing';

describe('AnsiPipe', () => {
  let ansiPipe: AnsiPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnsiPipe]
    });
    
    ansiPipe = TestBed.inject(AnsiPipe);
  });

  it('インスタンスを作成できる', () => {
    expect(ansiPipe).toBeTruthy();
  });

  it('赤色のANSIコードを処理できる', () => {
    const input = '\x1b[31mRed\x1b[0m';
    const result = ansiPipe.transform(input);
    
    // 結果が SafeHtml オブジェクトであることを確認
    expect(result).toBeTruthy();
    
    // 実際のHTMLコンテンツを確認（SafeHtmlからstringへの変換）
    const htmlContent = result.toString();
    expect(htmlContent).toContain('color: red');
  });
});