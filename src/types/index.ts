// src/types/index.ts

// انواع کاربر
export interface User {
  id: number;
  name: string;
  email: string;
}

// وضعیت احراز هویت
export interface AuthState {
  user: User | null;
  token: string | null;
  websiteUrl: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// انواع رویداد
export interface Event {
  event_id: number;
  event_name: string;
}

export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
}

// وضعیت اسکنر (تغییرات در این بخش انجام شد)
export interface ScanResult {
  status: 'SUCCESS' | 'FAIL';
  msg: string;
  name_customer?: string;
  seat?: string;
  checkin_time?: string;
  e_cal?: string;
  ticket_id?: number;
  ticket_status?: string;
  name_event?: string;
  ticket_type?: string;
  extra_service?: string;
  times_checked?: string;
  checks_remaining?: string;
  between_date?: string;
  msg_show?: string;
}

export interface ScannerState {
  isScanning: boolean;
  scanResult: ScanResult | null;
  error: string | null;
}

// وضعیت رابط کاربری
export interface UIState {
  showOnboarding: boolean;
  loading: boolean;
  error: string | null;
}