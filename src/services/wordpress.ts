import { API_BASE_URL, buildApiUrl } from "@/config/api";

interface LoginCredentials {
  username: string;
  password: string;
}

interface Vendor {
  term_id: number;
  name: string;
  slug: string;
  meta?: any;
}

interface LoginResponse {
  status: string;
  token?: string; // در این API ممکن است توکن نباشد
  msg?: string;
  code?: number;
  email: string;
  user_id: number;
  username: string;
  name: string;
  vendors: Vendor[];
}
interface EventsResponse {
  status: string;
  events: Array<{
    event_id: number;
    event_name: string;
  }>;
  msg?: string;
}

interface ValidateTicketRequest {
  event_id: number;
  qr_code: string;
  token: string;
}

interface ValidateTicketResponse {
  status: "SUCCESS" | "FAIL";
  msg: string;
  name_customer?: string;
  seat?: string;
  checkin_time?: string;
  e_cal?: string;
  ticket_id?: number;
}

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  status: string;
  user?: {
    id: number;
    name: string;
  };
  msg?: string;
}

interface LogoutRequest {
  token: string;
}

interface LogoutResponse {
  status: string;
  msg: string;
}

class WordPressService {
  private async makeRequest(
    websiteUrl: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = buildApiUrl(endpoint);

    // Enhanced logging for API request
    console.log("[DEBUG API] Making request:", {
      originalUrl: websiteUrl,
      baseUrl: API_BASE_URL,
      endpoint: endpoint,
      finalUrl: url,
      method: options.method || "GET",
      headers: options.headers,
      body: options.body ? "***" : undefined, // Don't log request body content
    });

    const defaultOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestConfig = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestConfig);

      console.log("[DEBUG API] Response received:", {
        url: url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error response text
        console.error("[DEBUG API] HTTP Error response:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }

      const data = await response.json();

      console.log("[DEBUG API] Response data:", {
        status: response.status,
        data: data,
      });

      return data;
    } catch (error) {
      console.error("[DEBUG API] Request failed:", {
        url: url,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      throw error;
    }
  }

  async login(
    credentials: LoginCredentials,
    websiteUrl: string,
  ): Promise<LoginResponse> {
    const endpoint = "login";
    const url = buildApiUrl(endpoint);

    const defaultOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }

      const data = await response.json();

      // خروجی جدید API دارای فیلد success و data است
      const normalizedStatus = data.success ? "SUCCESS" : "FAIL";

      return {
        status: normalizedStatus,
        token: data.data?.token || "", // اگر توکن وجود نداشت خالی می‌ماند
        code: 200,
        email: data.data?.user?.email || "",
        user_id: data.data?.user?.id || 0,
        username: data.data?.user?.username || credentials.username,
        name: data.data?.user?.name || "",
        vendors: data.data?.vendors || [],
        msg: data.success ? "ورود با موفقیت انجام شد" : "ورود ناموفق بود",
      };
    } catch (error) {
      console.error("[DEBUG API] Login request failed:", error);
      throw error;
    }
  }

  async getEvents(
    websiteUrl: string,
    token: string,
    userId: number,
  ): Promise<EventsResponse> {
    const endpoint = "get-events";
    const fullUrl = buildApiUrl(endpoint);

    console.log("[DEBUG API] Get events request:", {
      originalUrl: websiteUrl,
      baseUrl: API_BASE_URL,
      endpoint: endpoint,
      url: fullUrl,
      userId: userId,
      hasToken: !!token,
    });

    if (!token) {
      console.error(
        "[DEBUG API] No authentication token available for getEvents",
      );
      throw new Error("هیچ توکن احراز هویتی در دسترس نیست");
    }

    const url = fullUrl;

    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId, // Send user_id in the body as required by the API
      }),
    };

    try {
      const response = await fetch(url, options);

      console.log("[DEBUG API] Get events response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG API] Get events HTTP Error:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }

      const data = await response.json();

      console.log("[DEBUG API] Get events raw response:", data);

      // Check if the response is an array (successful case) or an object with error
      if (Array.isArray(data)) {
        // The API returns the events array directly
        console.log("[DEBUG API] Get events processed response (array):", {
          status: "SUCCESS",
          eventCount: data.length,
        });
        return {
          status: "SUCCESS",
          events: data,
        };
      } else if (data.status) {
        // The API returns a structured response
        console.log("[DEBUG API] Get events processed response (object):", {
          status: data.status,
          eventCount: data.events ? data.events.length : 0,
        });
        return data;
      } else {
        // Handle case where error info is returned directly
        console.error(
          "[DEBUG API] Get events unexpected response format:",
          data,
        );
        const result = {
          status: "FAIL",
          events: [],
          msg: data.message || data.msg || "خطا در دریافت رویدادها",
        };
        console.log(
          "[DEBUG API] Get events processed failure response:",
          result,
        );
        return result;
      }
    } catch (error) {
      console.error("[DEBUG API] Get events request failed:", error);
      throw error;
    }
  }

  async validateTicket(
    websiteUrl: string,
    request: ValidateTicketRequest,
    userId?: number,
  ): Promise<ValidateTicketResponse> {
    // Extract the hash from the QR code URL if it contains the full URL
    let qrCodeHash = request.qr_code;
    if (request.qr_code.includes("itiket.ir")) {
      // Extract hash from URL like https://itiket.ir/?post_type=event&check_qrcode=1fecc794704d1c8eb45299db297e6be6
      const urlParams = new URLSearchParams(request.qr_code.split("?")[1]);
      qrCodeHash = urlParams.get("check_qrcode") || request.qr_code;
    }

    const endpoint = "check-qr-code";
    const fullUrl = buildApiUrl(endpoint);

    console.log("[DEBUG API] Validate ticket request details:", {
      originalUrl: websiteUrl,
      baseUrl: API_BASE_URL,
      endpoint: endpoint,
      url: fullUrl,
      payload: {
        qr_code: qrCodeHash,
        user_id: userId,
        count_check: "1",
        token: "***", // Don't log actual token
      },
    });

    // Make the API call with the correct specification
    // According to the API spec, we send qr_code and count_check in the body
    const response = await this.makeRequest(
      websiteUrl,
      endpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qr_code: qrCodeHash,
          user_id: userId, // Include user_id in the request body as specified
          count_check: "1", // According to the API specification
        }),
      },
    );

    console.log("[DEBUG API] Raw API response:", response);

    // Transform the response to match our expected interface
    // The API returns different structure than our interface expects
    if (response.status && typeof response.status === "string") {
      // Map the API response to our interface
      // Consider 'valid', 'success', and 'warning' as valid statuses
      const isSuccessfulStatus = ["success", "valid", "warning"].includes(
        response.status.toLowerCase(),
      );
      const result: ValidateTicketResponse = {
        status: isSuccessfulStatus ? "SUCCESS" : "FAIL",
        msg: response.msg || response.message || "Response received",
      };

      // Add additional fields from the response
      // The API returns fields at the root level, not in a 'data' object
      result.name_customer = response.name_customer;
      result.seat = response.seat || response.ticket_id?.toString();
      result.checkin_time = response.checkin_time || response.check_in_time;
      result.ticket_id = response.ticket_id;
      result.e_cal = response.event_calendar;

      // Handle specific warning case (ticket already checked)
      if (response.status.toLowerCase() === "warning") {
        result.msg =
          response.msg ||
          response.message ||
          "This ticket has already been checked.";
        console.log(
          "[DEBUG API] Warning response (ticket already checked):",
          result,
        );
      }

      console.log("[DEBUG API] Transformed response:", result);
      return result;
    } else {
      // Default failure response
      return {
        status: "FAIL",
        msg: response.message || response.msg || "Invalid API response",
      };
    }
  }

  async validateToken(
    websiteUrl: string,
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    const endpoint = "check_login";
    const fullUrl = buildApiUrl(endpoint);

    console.log("[DEBUG API] Validate token request details:", {
      originalUrl: websiteUrl,
      baseUrl: API_BASE_URL,
      endpoint: endpoint,
      url: fullUrl,
      token: "***", // Don't log actual token
    });

    return this.makeRequest(websiteUrl, endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${request.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: request.token,
      }),
    });
  }

  async logout(
    websiteUrl: string,
    request: LogoutRequest,
  ): Promise<LogoutResponse> {
    const endpoint = "logout";
    const fullUrl = buildApiUrl(endpoint);

    console.log("[DEBUG API] Logout request details:", {
      originalUrl: websiteUrl,
      baseUrl: API_BASE_URL,
      endpoint: endpoint,
      url: fullUrl,
      token: "***", // Don't log actual token
    });

    return this.makeRequest(websiteUrl, endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${request.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: request.token,
      }),
    });
  }

  async getOrders(
    websiteUrl: string,
    username: string,
    password: string,
  ): Promise<any[]> {
    const endpoint = "orders";
    const url = buildApiUrl(endpoint);

    console.log("[DEBUG API] Get orders request:", { url, username });

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }), // ارسال یوزرنیم و پسورد به API
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }
      const data = await response.json();

      // خروجی API دارای فیلد success و data.orders است
      if (data.success && data.data && data.data.orders) {
        return data.data.orders;
      }
      return [];
    } catch (error) {
      console.error("[DEBUG API] Get orders failed:", error);
      throw error;
    }
  }

  async getStats(username: string, password: string): Promise<any> {
    const url = buildApiUrl("vendor/stats");

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }
      const data = await response.json();

      if (data.success && data.data && data.data.stats) {
        return data.data.stats;
      }
      return {};
    } catch (error) {
      console.error("[DEBUG API] Get stats failed:", error);
      throw error;
    }
  }

  async getProducts(
    websiteUrl: string,
    username: string,
    password: string,
  ): Promise<any[]> {
    const endpoint = "products";
    const url = buildApiUrl(endpoint);

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }
      const data = await response.json();

      if (data.success && data.data && data.data.products) {
        return data.data.products;
      }
      return [];
    } catch (error) {
      console.error("[DEBUG API] Get products failed:", error);
      throw error;
    }
  }

  async getVouchers(
    websiteUrl: string,
    username: string,
    password: string,
  ): Promise<any[]> {
    const endpoint = "vouchers";
    const url = buildApiUrl(endpoint);

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP Error! Status: ${response.status}, Message: ${errorText}`,
        );
      }
      const data = await response.json();

      if (data.success && data.data && data.data.vouchers) {
        return data.data.vouchers;
      }
      return [];
    } catch (error) {
      console.error("[DEBUG API] Get vouchers failed:", error);
      throw error;
    }
  }

  async checkVoucher(
    websiteUrl: string,
    username: string,
    password: string,
    voucherCode: string,
  ): Promise<any> {
    const endpoint = "voucher/check";
    const url = buildApiUrl(endpoint);

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, voucher_code: voucherCode }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // اگر وضعیت success=false بود، خطا را پرتاب می‌کنیم تا در صفحه بگیریم
      if (!response.ok || !data.success) {
        throw new Error(data?.error?.msg || "خطا در بررسی کوپن");
      }
      return data;
    } catch (error) {
      console.error("[DEBUG API] Check voucher failed:", error);
      throw error;
    }
  }
}

export const wordpressService = new WordPressService();
