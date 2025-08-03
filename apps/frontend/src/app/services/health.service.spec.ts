import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HealthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(HealthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('サービスが作成できる', () => {
    expect(service).toBeTruthy();
  });

  it('/api/healthエンドポイントからヘルスチェック情報を取得できる', () => {
    const mockHealthResponse = {
      status: 'ok',
      timestamp: '2025-01-03T10:00:00.000Z',
      version: '1.0.0'
    };

    service.checkHealth().subscribe(response => {
      expect(response).toEqual(mockHealthResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/health');
    expect(req.request.method).toEqual('GET');
    req.flush(mockHealthResponse);
  });

  it('ヘルスチェックのエラーをハンドリングできる', () => {
    const mockError = { status: 500, statusText: 'Internal Server Error' };

    service.checkHealth().subscribe({
      next: () => fail('エラーが発生するはずでした'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/health');
    req.flush('エラーが発生しました', mockError);
  });
});