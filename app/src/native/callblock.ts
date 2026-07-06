import { NativeModules, Platform } from 'react-native';

/**
 * 네이티브 통화 차단 모듈(CallBlock) 래퍼.
 * 안드로이드 전용 — dev build(네이티브 빌드)에서만 동작.
 * (Expo Go에서는 NativeModules.CallBlock이 없으므로 안전하게 no-op 처리)
 */
interface CallBlockNative {
  isSupported(): Promise<boolean>;
  isRoleHeld(): Promise<boolean>;
  requestRole(): Promise<boolean>;
  addNumber(number: string): Promise<boolean>;
  removeNumber(number: string): Promise<boolean>;
  getBlockedNumbers(): Promise<string[]>;
}

const native: CallBlockNative | undefined =
  Platform.OS === 'android' ? (NativeModules.CallBlock as CallBlockNative | undefined) : undefined;

export const callBlockAvailable = !!native;

export async function isSupported(): Promise<boolean> {
  return native ? native.isSupported() : false;
}

// 이 앱이 "통화 스크리닝 앱" 역할을 보유 중인지
export async function isRoleHeld(): Promise<boolean> {
  return native ? native.isRoleHeld() : false;
}

// 역할 요청 (시스템 팝업) — true면 승인됨
export async function requestRole(): Promise<boolean> {
  return native ? native.requestRole() : false;
}

export async function addBlockedNumber(number: string): Promise<boolean> {
  return native ? native.addNumber(number) : false;
}

export async function removeBlockedNumber(number: string): Promise<boolean> {
  return native ? native.removeNumber(number) : false;
}

export async function getBlockedNumbers(): Promise<string[]> {
  return native ? native.getBlockedNumbers() : [];
}
