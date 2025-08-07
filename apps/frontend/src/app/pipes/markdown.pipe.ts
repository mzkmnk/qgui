import { Pipe, PipeTransform, inject } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Prism from 'prismjs';

// Prism言語サポート
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  
  constructor() {
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
      
      // コードブロックにシンタックスハイライトを適用
      const highlightedHtml = this.applySyntaxHighlighting(html);
      
      // Crush風のダークテーマスタイルを適用
      const styledHtml = this.applyStyles(highlightedHtml);
      
      // サニタイズして安全なHTMLとして返す
      return this.sanitizer.bypassSecurityTrustHtml(styledHtml);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return value;
    }
  }
  
  private applySyntaxHighlighting(html: string): string {
    // コードブロックを検索してシンタックスハイライトを適用
    return html.replace(/<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g, 
      (match, lang, code) => {
        // HTMLエンティティをデコード
        const decodedCode = this.decodeHtmlEntities(code);
        
        if (lang && Prism.languages[lang]) {
          try {
            const highlighted = Prism.highlight(decodedCode, Prism.languages[lang], lang);
            return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
          } catch (e) {
            console.error('シンタックスハイライトエラー:', e);
          }
        }
        return match;
      });
  }
  
  private decodeHtmlEntities(text: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }

  private applyStyles(html: string): string {
    // スタイルクラスを追加
    return html
      // コードブロック
      .replace(/<pre>/g, '<pre class="bg-zinc-900 border border-zinc-700 rounded-lg p-4 overflow-x-auto my-2 language-">')
      .replace(/<code class="language-/g, '<code class="language-')
      // インラインコード
      .replace(/<code([^>]*)>/g, (match, attrs) => {
        // language-xxx クラスがない場合のみスタイルを追加
        if (!match.includes('class="language-')) {
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