// src/config/api.ts

declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

// مقدار پیش‌فرض در صورت عدم وجود فایل کانفیگ
const defaultApiUrl = "https://book.thesenseofpersia.com/wp-json/eventoapi/v1";

// خواندن از window (در مرورگر) یا fallback به متغیر محیطی و در نهایت مقدار پیش‌فرض
export const API_BASE_URL =
  typeof window !== "undefined" && window.RUNTIME_CONFIG?.API_BASE_URL
    ? window.RUNTIME_CONFIG.API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL || defaultApiUrl;

// تابع کمکی برای ساخت URL کامل اندپوینت‌ها
export function buildApiUrl(endpoint: string): string {
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${cleanBaseUrl}/${cleanEndpoint}`;
}