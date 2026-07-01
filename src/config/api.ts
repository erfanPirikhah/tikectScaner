// src/config/api.ts

declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

const defaultApiUrl = "https://takhfinet.com/wp-json/takhfifanbizpwa/v1";

// خواندن از window (در مرورگر) یا fallback به مقادیر پیش‌فرض
export const API_BASE_URL =
  typeof window !== "undefined" && window.RUNTIME_CONFIG?.API_BASE_URL
    ? window.RUNTIME_CONFIG.API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL || defaultApiUrl;

export function buildApiUrl(endpoint: string): string {
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");

  return `${cleanBaseUrl}/${cleanEndpoint}`;
}