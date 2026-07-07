const TOKEN_KEY = "@token";
const WEBSITE_URL_KEY = "@websiteUrl";
const ONBOARDING_KEY = "@showOnboarding";
const VENDORS_KEY = "@vendors";
const USER_KEY = "@user";
const USERNAME_KEY = "@username";
const PASSWORD_KEY = "@password";

interface StoredData {
  token: string | null;
  websiteUrl: string | null;
  showOnboarding: boolean;
  vendors: any[] | null;
  user: any | null;
  username: string | null;
  password: string | null;
}

export const storageService = {
  setToken: (token: string | null): void => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setWebsiteUrl: (url: string | null): void => {
    if (url) localStorage.setItem(WEBSITE_URL_KEY, url);
    else localStorage.removeItem(WEBSITE_URL_KEY);
  },
  getWebsiteUrl: (): string | null => localStorage.getItem(WEBSITE_URL_KEY),

  setShowOnboarding: (show: boolean): void => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(show));
  },
  getShowOnboarding: (): boolean => {
    const value = localStorage.getItem(ONBOARDING_KEY);
    return value ? JSON.parse(value) : true;
  },

  setVendors: (vendors: any[] | null): void => {
    if (vendors) localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
    else localStorage.removeItem(VENDORS_KEY);
  },
  getVendors: (): any[] | null => {
    const value = localStorage.getItem(VENDORS_KEY);
    return value ? JSON.parse(value) : null;
  },

  setUser: (user: any | null): void => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },
  getUser: (): any | null => {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  },

  // متدهای جدید برای یوزرنیم و پسورد
  setUsername: (username: string | null): void => {
    if (username) localStorage.setItem(USERNAME_KEY, username);
    else localStorage.removeItem(USERNAME_KEY);
  },
  getUsername: (): string | null => localStorage.getItem(USERNAME_KEY),

  setPassword: (password: string | null): void => {
    if (password) localStorage.setItem(PASSWORD_KEY, password);
    else localStorage.removeItem(PASSWORD_KEY);
  },
  getPassword: (): string | null => localStorage.getItem(PASSWORD_KEY),

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WEBSITE_URL_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(VENDORS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(PASSWORD_KEY);
  },

  // پاک کردن فقط اطلاعات کاربر (بدون پاک کردن showOnboarding)
  clearUserData: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WEBSITE_URL_KEY);
    localStorage.removeItem(VENDORS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(PASSWORD_KEY);
  },

  getAll: (): StoredData => {
    return {
      token: storageService.getToken(),
      websiteUrl: storageService.getWebsiteUrl(),
      showOnboarding: storageService.getShowOnboarding(),
      vendors: storageService.getVendors(),
      user: storageService.getUser(),
      username: storageService.getUsername(),
      password: storageService.getPassword(),
    };
  },
};
