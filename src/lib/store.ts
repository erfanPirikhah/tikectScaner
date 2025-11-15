import { create } from 'zustand';
import { AuthState, EventState, ScannerState, UIState, User, Event, ScanResult } from '@/types';

// Auth Store
interface AuthStore extends AuthState {
  login: (user: User, token: string, websiteUrl: string) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
  setWebsiteUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  websiteUrl: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  
  login: (user, token, websiteUrl) => set({ 
    user, 
    token, 
    websiteUrl, 
    isLoggedIn: true, 
    loading: false, 
    error: null 
  }),
  
  logout: () => set({ 
    user: null, 
    token: null, 
    websiteUrl: null, 
    isLoggedIn: false, 
    loading: false, 
    error: null 
  }),
  
  setToken: (token) => set({ token }),
  setWebsiteUrl: (websiteUrl) => set({ websiteUrl }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));

// Event Store
interface EventStore extends EventState {
  setEvents: (events: Event[]) => void;
  setSelectedEvent: (event: Event | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  
  setEvents: (events) => set({ events }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  clearEvents: () => set({ events: [], selectedEvent: null }),
}));

// Scanner Store
interface ScannerStore extends ScannerState {
  startScanning: () => void;
  stopScanning: () => void;
  setScanResult: (result: ScanResult | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useScannerStore = create<ScannerStore>((set) => ({
  isScanning: false,
  scanResult: null,
  error: null,
  
  startScanning: () => set({ isScanning: true, scanResult: null, error: null }),
  stopScanning: () => set({ isScanning: false }),
  setScanResult: (scanResult) => set({ scanResult }),
  setError: (error) => set({ error }),
  reset: () => set({ isScanning: false, scanResult: null, error: null }),
}));

// UI Store
interface UIStore extends UIState {
  setShowOnboarding: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showOnboarding: true,
  loading: false,
  error: null,
  
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ loading: false, error: null }),
}));