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

    // Enhanced logging for API request
    console.log('[DEBUG API] Making request:', {
      url: url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? '***' : undefined // Don't log request body content
    });

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

      console.log('[DEBUG API] Response received:', {
        url: url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error response text
        console.error('[DEBUG API] HTTP Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`HTTP Error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();

      console.log('[DEBUG API] Response data:', {
        status: response.status,
        data: data
      });

      return data;
    } catch (error) {
      console.error('[DEBUG API] Request failed:', {
        url: url,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }

  async login(credentials: LoginCredentials, websiteUrl: string): Promise<LoginResponse> {
    const url = `${websiteUrl}wp-json/itiket-api/v1/login`;

    console.log('[DEBUG API] Login request:', {
      url: url,
      credentials: {
        username: credentials.username,
        password: '***' // Don't log password
      }
    });

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

      console.log('[DEBUG API] Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG API] Login HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`HTTP Error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();

      console.log('[DEBUG API] Login response data:', data);

      // Transform the actual response to match the expected format
      // API returns lowercase status, normalize it to uppercase for consistency
      const normalizedStatus = data.status ?
        data.status.toUpperCase() === 'SUCCESS' ? 'SUCCESS' :
        data.status.toUpperCase() === 'FAIL' ? 'FAIL' :
        data.status.toUpperCase()
        : 'FAIL';

      console.log('[DEBUG API] Login processed response:', {
        status: normalizedStatus,
        token: data.token ? '***' : '', // Don't log actual token
        msg: data.msg
      });

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
      console.error('[DEBUG API] Login request failed:', error);
      throw error;
    }
  }

  async getEvents(websiteUrl: string, token: string, userId: number): Promise<EventsResponse> {
    console.log('[DEBUG API] Get events request:', {
      url: `${websiteUrl}wp-json/itiket-api/v1/get-events`,
      userId: userId,
      hasToken: !!token
    });

    if (!token) {
      console.error('[DEBUG API] No authentication token available for getEvents');
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

      console.log('[DEBUG API] Get events response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG API] Get events HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`HTTP Error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();

      console.log('[DEBUG API] Get events raw response:', data);

      // Check if the response is an array (successful case) or an object with error
      if (Array.isArray(data)) {
        // The API returns the events array directly
        console.log('[DEBUG API] Get events processed response (array):', {
          status: 'SUCCESS',
          eventCount: data.length
        });
        return {
          status: 'SUCCESS',
          events: data
        };
      } else if (data.status) {
        // The API returns a structured response
        console.log('[DEBUG API] Get events processed response (object):', {
          status: data.status,
          eventCount: data.events ? data.events.length : 0
        });
        return data;
      } else {
        // Handle case where error info is returned directly
        console.error('[DEBUG API] Get events unexpected response format:', data);
        const result = {
          status: 'FAIL',
          events: [],
          msg: data.message || data.msg || 'خطا در دریافت رویدادها'
        };
        console.log('[DEBUG API] Get events processed failure response:', result);
        return result;
      }
    } catch (error) {
      console.error('[DEBUG API] Get events request failed:', error);
      throw error;
    }
  }

  async validateTicket(websiteUrl: string, request: ValidateTicketRequest, userId?: number): Promise<ValidateTicketResponse> {
    // Extract the hash from the QR code URL if it contains the full URL
    let qrCodeHash = request.qr_code;
    if (request.qr_code.includes('itiket.ir')) {
      // Extract hash from URL like https://itiket.ir/?post_type=event&check_qrcode=1fecc794704d1c8eb45299db297e6be6
      const urlParams = new URLSearchParams(request.qr_code.split('?')[1]);
      qrCodeHash = urlParams.get('check_qrcode') || request.qr_code;
    }

    console.log('[DEBUG API] Validate ticket request details:', {
      url: `${websiteUrl}wp-json/itiket-api/v1/check-qr-code`,
      payload: {
        qr_code: qrCodeHash,
        user_id: userId,
        count_check: "1",
        token: '***', // Don't log actual token
      }
    });

    // Make the API call with the correct specification
    // According to the API spec, we send qr_code and count_check in the body
    const response = await this.makeRequest(websiteUrl, 'wp-json/itiket-api/v1/check-qr-code', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCodeHash,
        user_id: userId, // Include user_id in the request body as specified
        count_check: "1"  // According to the API specification
      }),
    });

    console.log('[DEBUG API] Raw API response:', response);

    // Transform the response to match our expected interface
    // The API returns different structure than our interface expects
    if (response.status && typeof response.status === 'string') {
      // Map the API response to our interface
      // Consider 'valid', 'success', and 'warning' as valid statuses
      const isSuccessfulStatus = ['success', 'valid', 'warning'].includes(response.status.toLowerCase());
      const result: ValidateTicketResponse = {
        status: isSuccessfulStatus ? 'SUCCESS' : 'FAIL',
        msg: response.msg || response.message || 'Response received',
      };

      // Add additional fields from the response
      // The API returns fields at the root level, not in a 'data' object
      result.name_customer = response.name_customer;
      result.seat = response.seat || response.ticket_id?.toString();
      result.checkin_time = response.checkin_time || response.check_in_time;
      result.ticket_id = response.ticket_id;
      result.e_cal = response.event_calendar;

      // Handle specific warning case (ticket already checked)
      if (response.status.toLowerCase() === 'warning') {
        result.msg = response.msg || response.message || 'This ticket has already been checked.';
        console.log('[DEBUG API] Warning response (ticket already checked):', result);
      }

      console.log('[DEBUG API] Transformed response:', result);
      return result;
    } else {
      // Default failure response
      return {
        status: 'FAIL',
        msg: response.message || response.msg || 'Invalid API response',
      };
    }
  }

  async validateToken(websiteUrl: string, request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    console.log('[DEBUG API] Validate token request details:', {
      url: `${websiteUrl}wp-json/meup/v1/check_login`,
      token: '***' // Don't log actual token
    });

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
    console.log('[DEBUG API] Logout request details:', {
      url: `${websiteUrl}wp-json/itiket-api/v1/logout`,
      token: '***' // Don't log actual token
    });

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