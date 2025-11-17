import { useAuthStore } from '@/lib/store';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  status: string;
  token: string;
  msg?: string;
  code?: number;
  email: string;
  user_id: number;
  username: string;
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
  status: 'SUCCESS' | 'FAIL';
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
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${websiteUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

      if (!response.ok) {
        throw new Error(`خطای HTTP! وضعیت: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`فراخوانی API به ${url} ناموفق بود:`, error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials, websiteUrl: string): Promise<LoginResponse> {
    const url = `${websiteUrl}wp-json/itiket-api/v1/login`;

    const defaultOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`خطای HTTP! وضعیت: ${response.status}`);
      }

      const data = await response.json();

      // Transform the actual response to match the expected format
      // API returns lowercase status, normalize it to uppercase for consistency
      const normalizedStatus = data.status ?
        data.status.toUpperCase() === 'SUCCESS' ? 'SUCCESS' :
        data.status.toUpperCase() === 'FAIL' ? 'FAIL' :
        data.status.toUpperCase()
        : 'FAIL';

      return {
        status: normalizedStatus,
        token: data.token || '',
        code: data.code,
        email: data.email,
        user_id: data.user_id,
        username: data.username,
        msg: data.msg
      };
    } catch (error) {
      console.error(`فراخوانی API به ${url} ناموفق بود:`, error);
      throw error;
    }
  }

  async getEvents(websiteUrl: string, token: string, userId: number): Promise<EventsResponse> {
    if (!token) {
      throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    }

    const url = `${websiteUrl}wp-json/itiket-api/v1/get-events`;

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId  // Send user_id in the body as required by the API
      }),
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`خطای HTTP! وضعیت: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response is an array (successful case) or an object with error
      if (Array.isArray(data)) {
        // The API returns the events array directly
        return {
          status: 'SUCCESS',
          events: data
        };
      } else if (data.status) {
        // The API returns a structured response
        return data;
      } else {
        // Handle case where error info is returned directly
        return {
          status: 'FAIL',
          events: [],
          msg: data.message || data.msg || 'خطا در دریافت رویدادها'
        };
      }
    } catch (error) {
      console.error(`فراخوانی API به ${url} ناموفق بود:`, error);
      throw error;
    }
  }

  async validateTicket(websiteUrl: string, request: ValidateTicketRequest): Promise<ValidateTicketResponse> {
    return this.makeRequest(websiteUrl, 'wp-json/itiket-api/v1/check-qr-code', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: request.qr_code, // According to wp.json, this endpoint expects 'qr_code'
        token: request.token      // Include token in the request body as well
      }),
    });
  }

  async validateToken(websiteUrl: string, request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    return this.makeRequest(websiteUrl, 'wp-json/meup/v1/check_login', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: request.token,
      }),
    });
  }

  async logout(websiteUrl: string, request: LogoutRequest): Promise<LogoutResponse> {
    return this.makeRequest(websiteUrl, 'wp-json/itiket-api/v1/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: request.token,
      }),
    });
  }
}

export const wordpressService = new WordPressService();