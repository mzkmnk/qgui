import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
    // markedの設定
    marked.setOptions({
      gfm: true,
      breaks: true,
      pedantic: false
    });
  }

  transform(value: string): SafeHtml {
    if (!value) return '';

    try {
      // マークダウンをHTMLに変換
      const html = marked.parse(value) as string;
      
      // Crush風のダークテーマスタイルを適用
      const styledHtml = this.applyStyles(html);
      
      // サニタイズして安全なHTMLとして返す
      return this.sanitizer.bypassSecurityTrustHtml(styledHtml);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return value;
    }
  }

  private applyStyles(html: string): string {
    // スタイルクラスを追加
    return html
      // コードブロック
      .replace(/<pre>/g, '<pre class="bg-zinc-900 border border-zinc-700 rounded-lg p-4 overflow-x-auto my-2">')
      .replace(/<code>/g, '<code class="text-orange-400">')
      // インラインコード
      .replace(/<code([^>]*)>/g, (match, attrs) => {
        if (!match.includes('class=')) {
          return '<code class="bg-zinc-800 text-orange-400 px-1 py-0.5 rounded text-sm" ' + attrs + '>';
        }
        return match;
      })
      // 見出し
      .replace(/<h1>/g, '<h1 class="text-xl font-bold text-gray-100 mt-4 mb-2">')
      .replace(/<h2>/g, '<h2 class="text-lg font-semibold text-gray-100 mt-3 mb-2">')
      .replace(/<h3>/g, '<h3 class="text-base font-semibold text-gray-200 mt-2 mb-1">')
      // リスト
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-1 my-2 text-gray-200">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-1 my-2 text-gray-200">')
      .replace(/<li>/g, '<li class="ml-2">')
      // 段落
      .replace(/<p>/g, '<p class="my-2 text-gray-200 leading-relaxed">')
      // リンク
      .replace(/<a /g, '<a class="text-orange-400 hover:text-orange-300 underline transition-colors" ')
      // 引用
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-orange-500 pl-4 my-2 text-gray-300 italic">')
      // テーブル
      .replace(/<table>/g, '<table class="min-w-full divide-y divide-zinc-700 my-2">')
      .replace(/<thead>/g, '<thead class="bg-zinc-800">')
      .replace(/<th>/g, '<th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">')
      .replace(/<tbody>/g, '<tbody class="bg-zinc-900 divide-y divide-zinc-700">')
      .replace(/<td>/g, '<td class="px-4 py-2 text-sm text-gray-200">')
      // 水平線
      .replace(/<hr>/g, '<hr class="my-4 border-zinc-700">');
  }
}