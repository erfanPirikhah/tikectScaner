const TOKEN_KEY = '@token';
const WEBSITE_URL_KEY = '@websiteUrl';
const ONBOARDING_KEY = '@showOnboarding';
const VENDORS_KEY = '@vendors';
const USER_KEY = '@user';

interface StoredData {
  token: string | null;
  websiteUrl: string | null;
  showOnboarding: boolean;
  vendors: any[] | null;
  user: any | null;
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

  // Vendors management
  setVendors: (vendors: any[] | null): void => {
    if (vendors) {
      localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
    } else {
      localStorage.removeItem(VENDORS_KEY);
    }
  },

  getVendors: (): any[] | null => {
    const value = localStorage.getItem(VENDORS_KEY);
    return value ? JSON.parse(value) : null;
  },

  // User management
  setUser: (user: any | null): void => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  getUser: (): any | null => {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  },

  // Clear all stored data
  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WEBSITE_URL_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(VENDORS_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get all stored data
  getAll: (): StoredData => {
    return {
      token: storageService.getToken(),
      websiteUrl: storageService.getWebsiteUrl(),
      showOnboarding: storageService.getShowOnboarding(),
      vendors: storageService.getVendors(),
      user: storageService.getUser(),
    };
  },
};