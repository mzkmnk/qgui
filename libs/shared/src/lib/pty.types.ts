/**
 * PTYプロセス管理の共有型定義
 * 自動生成された型を再エクスポート
 */

import { components } from './generated/pty-process.types';

// スキーマから型をエクスポート
export type PTYProcessState = components['schemas']['PTYProcessState'];
export type PTYProcessInfo = components['schemas']['PTYProcessInfo'];
export type PTYDataMessage = components['schemas']['PTYDataMessage'];
export type PTYLifecycleEvent = components['schemas']['PTYLifecycleEvent'];
export type PTYProcessCreateRequest =
  components['schemas']['PTYProcessCreateRequest'];
export type PTYProcessCreateResponse =
  components['schemas']['PTYProcessCreateResponse'];
export type PTYResizeRequest = components['schemas']['PTYResizeRequest'];
export type PTYControlCommand = components['schemas']['PTYControlCommand'];
