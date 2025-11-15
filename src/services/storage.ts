const TOKEN_KEY = '@token';
const WEBSITE_URL_KEY = '@websiteUrl';
const ONBOARDING_KEY = '@showOnboarding';

interface StoredData {
  token: string | null;
  websiteUrl: string | null;
  showOnboarding: boolean;
}

export const storageService = {
  // Token management
  setToken: (token: string | null): void => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Website URL management
  setWebsiteUrl: (url: string | null): void => {
    if (url) {
      localStorage.setItem(WEBSITE_URL_KEY, url);
    } else {
      localStorage.removeItem(WEBSITE_URL_KEY);
    }
  },

  getWebsiteUrl: (): string | null => {
    return localStorage.getItem(WEBSITE_URL_KEY);
  },

  // Onboarding management
  setShowOnboarding: (show: boolean): void => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(show));
  },

  getShowOnboarding: (): boolean => {
    const value = localStorage.getItem(ONBOARDING_KEY);
    return value ? JSON.parse(value) : true;
  },

  // Clear all stored data
  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WEBSITE_URL_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  },

  // Get all stored data
  getAll: (): StoredData => {
    return {
      token: storageService.getToken(),
      websiteUrl: storageService.getWebsiteUrl(),
      showOnboarding: storageService.getShowOnboarding(),
    };
  },
};