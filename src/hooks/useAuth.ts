import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';

export const useAuth = () => {
  const { 
    user, 
    token, 
    websiteUrl, 
    isLoggedIn, 
    login, 
    logout, 
    setToken, 
    setWebsiteUrl 
  } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    const storedData = storageService.getAll();

    if (storedData.token) {
      const token = storedData.token;
      // Use stored websiteUrl if available, otherwise use current domain
      const websiteUrl = storedData.websiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');

      // Verify token is still valid
      const verifyToken = async () => {
        try {
          setToken(token);
          setWebsiteUrl(websiteUrl);

          const response = await wordpressService.validateToken(websiteUrl, {
            token,
          });

          if (response.status === 'SUCCESS' && response.user) {
            login(
              {
                id: response.user.id,
                name: response.user.name,
                email: '' // Email not provided by validation endpoint
              },
              token,
              websiteUrl
            );
          } else {
            // Token invalid, clear stored data
            storageService.clearAll();
            logout();
          }
        } catch (error) {
          console.error('اعتبارسنجی توکن ناموفق بود:', error);
          storageService.clearAll();
          logout();
        }
      };

      verifyToken();
    }
  }, [login, logout, setToken, setWebsiteUrl]);

  return {
    user,
    token,
    websiteUrl,
    isLoggedIn,
    login: async (username: string, password: string, websiteUrl?: string) => {
      try {
        // Add a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use current domain if no websiteUrl is provided
        const currentWebsiteUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');

        const loginResponse = await wordpressService.login({
          username,
          password,
        }, currentWebsiteUrl); // Pass currentWebsiteUrl directly to login method

        if (loginResponse.status === 'SUCCESS' && loginResponse.token) {
          // Store the website URL and token
          storageService.setWebsiteUrl(currentWebsiteUrl);
          storageService.setToken(loginResponse.token);

          // Call the store's login function with the current website URL
          login(
            {
              id: loginResponse.user_id || 0,
              name: loginResponse.username || username,
              email: loginResponse.email || ''
            },
            loginResponse.token,
            currentWebsiteUrl
          );

          return { success: true, message: loginResponse.msg || 'ورود موفقیت‌آمیز' };
        } else {
          return { success: false, message: loginResponse.msg || 'ورود ناموفق بود' };
        }
      } catch (error) {
        console.error('خطای ورود:', error);
        return { success: false, message: 'خطای شبکه. لطفاً دوباره تلاش کنید.' };
      }
    },
    logout: () => {
      storageService.clearAll();
      logout();
    },
  };
};