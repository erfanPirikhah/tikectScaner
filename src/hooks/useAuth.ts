import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { storageService } from "@/services/storage";
import { wordpressService } from "@/services/wordpress";

export const useAuth = () => {
  const {
    user,
    token,
    websiteUrl,
    vendors,
    isLoggedIn,
    login,
    logout,
    setToken,
    setWebsiteUrl,
  } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    const storedData = storageService.getAll();

    if (storedData.token) {
      const token = storedData.token;
      const websiteUrl =
        storedData.websiteUrl ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const user = storedData.user;
      const vendors = storedData.vendors;

      // Verify token is still valid
      const verifyToken = async () => {
        try {
          setToken(token);
          setWebsiteUrl(websiteUrl);

          // اگر اطلاعات کاربر از قبل در لوکال استوریج بود، لاگین را ریستور کن
          if (user) {
            login(user, token, websiteUrl, vendors);
          }

          // اینجا می‌توانید در صورت نیاز توکن را اعتبارسنجی کنید
          // const response = await wordpressService.validateToken(websiteUrl, { token });
          // اگر اعتبارسنجی لازم نبود، کدهای بالا کافی است
        } catch (error) {
          console.error("اعتبارسنجی توکن ناموفق بود:", error);
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
    vendors,
    isLoggedIn,
    login: async (username: string, password: string, websiteUrl?: string) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const currentWebsiteUrl =
          websiteUrl ||
          (typeof window !== "undefined" ? window.location.origin : "");

        const loginResponse = await wordpressService.login(
          {
            username,
            password,
          },
          currentWebsiteUrl,
        );

        if (loginResponse.status === "SUCCESS") {
          const userData = {
            id: loginResponse.user_id || 0,
            name: loginResponse.name || username,
            email: loginResponse.email || "",
            username: loginResponse.username || username,
          };

          // ذخیره در localStorage
          storageService.setWebsiteUrl(currentWebsiteUrl);
          storageService.setToken(loginResponse.token || "session_active");
          storageService.setVendors(loginResponse.vendors);
          storageService.setUser(userData);

          // ذخیره یوزرنیم و پسورد برای استفاده در APIهای دیگر (مثل سفارشات)
          storageService.setUsername(username);
          storageService.setPassword(password);

          // ذخیره در Zustand Store
          login(
            userData,
            loginResponse.token || "session_active",
            currentWebsiteUrl,
            loginResponse.vendors,
          );

          return { success: true, message: "ورود با موفقیت انجام شد" };
        } else {
          return {
            success: false,
            message: loginResponse.msg || "نام کاربری یا رمز عبور اشتباه است",
          };
        }
      } catch (error) {
        console.error("خطای ورود:", error);
        return {
          success: false,
          message: "خطای شبکه. لطفاً دوباره تلاش کنید.",
        };
      }
    },
    logout: () => {
      storageService.clearAll();
      logout();
    },
  };
};
