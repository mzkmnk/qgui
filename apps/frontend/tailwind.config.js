const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
import PrimeUI from 'tailwindcss-primeui';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Neural Dark - 次世代エンジニア向けカラーパレット
        neural: {
          void: '#0a0b0f', // 最深部の黒
          dark: '#0f111a', // メイン背景
          darker: '#151823', // カード背景
          surface: '#1a1d2e', // サーフェース
          border: '#2a2d3a', // ボーダー
          muted: '#6c7086', // ミュートテキスト
          subtle: '#959cbd', // サブテキスト
          text: '#c9d1d9', // メインテキスト
          bright: '#e6edf3', // 明るいテキスト
        },
        accent: {
          neon: '#00d9ff', // ネオンシアン（メインアクセント）
          electric: '#00ff88', // エレクトリックグリーン
          plasma: '#7c3aed', // プラズマパープル
          quantum: '#06b6d4', // クォンタムブルー
          fusion: '#f97316', // フュージョンオレンジ
          matrix: '#10b981', // マトリックスグリーン
          danger: '#ef4444', // デンジャーレッド
        },
        glow: {
          neon: 'rgba(0, 217, 255, 0.15)', // ネオングロー
          electric: 'rgba(0, 255, 136, 0.15)', // エレクトリックグロー
          plasma: 'rgba(124, 58, 237, 0.15)', // プラズマグロー
        },
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
        'neon-sm': '0 0 10px rgba(0, 217, 255, 0.4)',
        electric: '0 0 20px rgba(0, 255, 136, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(0, 217, 255, 0.1)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': {
            boxShadow:
              '0 0 30px rgba(0, 217, 255, 0.8), 0 0 50px rgba(0, 217, 255, 0.4)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [PrimeUI],
};
