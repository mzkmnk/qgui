import { Injectable, Logger } from '@nestjs/common';

/**
 * 循環バッファクラス
 */
class CircularBuffer {
  private buffer = '';
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  append(data: string): void {
    this.buffer += data;
    
    // バッファサイズが制限を超えた場合、古いデータを削除
    if (this.buffer.length > this.maxSize) {
      const excess = this.buffer.length - this.maxSize;
      this.buffer = this.buffer.substring(excess);
    }
  }

  getContent(): string {
    return this.buffer;
  }

  getSize(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = '';
  }
}

@Injectable()
export class BufferLimitService {
  private readonly logger = new Logger(BufferLimitService.name);
  private maxBufferSize: number = 10 * 1024 * 1024; // デフォルト10MB
  private buffers: Map<string, CircularBuffer> = new Map();
  private readonly warningThreshold = 0.8; // 80%で警告

  /**
   * 最大バッファサイズを取得
   */
  getMaxBufferSize(): number {
    return this.maxBufferSize;
  }

  /**
   * 最大バッファサイズを設定
   */
  setMaxBufferSize(size: number): void {
    if (size <= 0) {
      throw new Error('バッファサイズは正の値である必要があります');
    }
    
    this.maxBufferSize = size;
    this.logger.log(`最大バッファサイズを${this.formatBytes(size)}に設定`);
    
    // 既存のバッファのサイズも更新
    this.buffers.forEach((buffer, sessionId) => {
      const newBuffer = new CircularBuffer(size);
      newBuffer.append(buffer.getContent());
      this.buffers.set(sessionId, newBuffer);
    });
  }

  /**
   * 新しいバッファを作成
   */
  createBuffer(sessionId: string): CircularBuffer {
    const buffer = new CircularBuffer(this.maxBufferSize);
    this.buffers.set(sessionId, buffer);
    this.logger.log(`バッファ作成: セッション ${sessionId}`);
    return buffer;
  }

  /**
   * バッファを取得
   */
  getBuffer(sessionId: string): CircularBuffer | undefined {
    return this.buffers.get(sessionId);
  }

  /**
   * バッファにデータを追加
   */
  appendToBuffer(sessionId: string, data: string): void {
    let buffer = this.buffers.get(sessionId);
    
    if (!buffer) {
      this.logger.warn(`バッファが存在しません: セッション ${sessionId}`);
      buffer = this.createBuffer(sessionId);
    }
    
    buffer.append(data);
    
    // メモリ使用量をチェック
    if (this.isMemoryWarning()) {
      this.logger.warn(`メモリ使用量が警告レベルに達しました: ${this.getMemoryUsagePercent()}%`);
    }
  }

  /**
   * バッファをクリア
   */
  clearBuffer(sessionId: string): void {
    const buffer = this.buffers.get(sessionId);
    if (buffer) {
      buffer.clear();
      this.logger.log(`バッファクリア: セッション ${sessionId}`);
    }
  }

  /**
   * バッファを削除
   */
  deleteBuffer(sessionId: string): void {
    if (this.buffers.delete(sessionId)) {
      this.logger.log(`バッファ削除: セッション ${sessionId}`);
    }
  }

  /**
   * メモリ使用量統計を取得
   */
  getMemoryStats(): {
    totalBuffers: number;
    totalMemoryUsage: number;
    averageBufferSize: number;
    maxBufferSize: number;
  } {
    const totalMemoryUsage = Array.from(this.buffers.values()).reduce(
      (total, buffer) => total + buffer.getSize(),
      0
    );
    
    const totalBuffers = this.buffers.size;
    const averageBufferSize = totalBuffers > 0 ? totalMemoryUsage / totalBuffers : 0;
    
    return {
      totalBuffers,
      totalMemoryUsage,
      averageBufferSize,
      maxBufferSize: this.maxBufferSize,
    };
  }

  /**
   * メモリ使用量が警告レベルかチェック
   */
  isMemoryWarning(): boolean {
    const stats = this.getMemoryStats();
    const usagePercent = stats.totalMemoryUsage / (this.maxBufferSize * stats.totalBuffers || 1);
    return usagePercent >= this.warningThreshold;
  }

  /**
   * メモリ使用率を取得
   */
  private getMemoryUsagePercent(): number {
    const stats = this.getMemoryStats();
    const totalMaxSize = this.maxBufferSize * stats.totalBuffers;
    return totalMaxSize > 0 ? Math.round((stats.totalMemoryUsage / totalMaxSize) * 100) : 0;
  }

  /**
   * バイト数を読みやすい形式にフォーマット
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * CircularBufferクラスを取得（テスト用）
   */
  getCircularBufferClass(): typeof CircularBuffer {
    return CircularBuffer;
  }

  /**
   * 全バッファをクリーンアップ
   */
  cleanupAll(): void {
    this.logger.log(`全バッファのクリーンアップ: ${this.buffers.size}個のバッファ`);
    this.buffers.clear();
  }
}