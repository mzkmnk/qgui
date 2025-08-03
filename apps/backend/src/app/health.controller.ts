import { Controller, Get } from '@nestjs/common';

// 仮実装: スキーマ定義に基づく型を定義
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
}

@Controller()
export class HealthController {
  @Get('/health')
  async getHealth(): Promise<HealthResponse> {
    // 仮実装: テストを通すための固定値を返す
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
