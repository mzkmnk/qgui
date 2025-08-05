import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'ansi',
  standalone: true,
})
export class AnsiPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    // 最小限の実装: 赤色のANSIコードのみ処理
    const html = value
      // eslint-disable-next-line no-control-regex
      .replace(/\x1b\[31m/g, '<span style="color: red">')
      // eslint-disable-next-line no-control-regex
      .replace(/\x1b\[0m/g, '</span>');

    // 安全なHTMLとしてマーク
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
