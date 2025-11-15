// User types
export interface User {
  id: number;
  name: string;
  email: string;
}

// Authentication state
export interface AuthState {
  user: User | null;
  token: string | null;
  websiteUrl: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// Event types
export interface Event {
  ID: number;
  post_title: string;
  post_content: string;
  event_date: string;
  status: string;
}

export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
}

// Scanner state
export interface ScanResult {
  status: 'SUCCESS' | 'FAIL';
  msg: string;
  name_customer?: string;
  seat?: string;
  checkin_time?: string;
  e_cal?: string;
  ticket_id?: number;
}

export interface ScannerState {
  isScanning: boolean;
  scanResult: ScanResult | null;
  error: string | null;
}

// UI state
export interface UIState {
  showOnboarding: boolean;
  loading: boolean;
  error: string | null;
}