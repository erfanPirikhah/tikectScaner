// src/services/wordpress.ts
import { buildApiUrl, API_BASE_URL } from '@/config/api';

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
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
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
        const errorText = await response.text();
        throw new Error(`HTTP Error! Status: ${response.status}, Message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[DEBUG API] Request failed:', { url, error });
      throw error;
    }
  }

  async login(credentials: LoginCredentials, websiteUrl?: string): Promise<LoginResponse> {
    // تغییر مسیر به eventoapi/v1/login
    const url = buildApiUrl('login');
    
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    };

    try {
      const data = await this.makeRequest(url, options);

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
      throw error;
    }
  }

  async getEvents(websiteUrl?: string, token?: string, userId?: number): Promise<EventsResponse> {
    if (!token) throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    
    // تغییر مسیر به eventoapi/v1/events
    const url = buildApiUrl('events');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    };

    try {
      const data = await this.makeRequest(url, options);

      if (Array.isArray(data)) {
        return { status: 'SUCCESS', events: data };
      } else if (data.status) {
        return data;
      } else {
        return { status: 'FAIL', events: [], msg: data.message || data.msg || 'خطا در دریافت رویدادها' };
      }
    } catch (error) {
      throw error;
    }
  }

  async validateTicket(websiteUrl?: string, request?: ValidateTicketRequest, userId?: number): Promise<ValidateTicketResponse> {
    let qrCodeHash = request.qr_code;
    if (request.qr_code.includes('itiket.ir')) {
      const urlParams = new URLSearchParams(request.qr_code.split('?')[1]);
      qrCodeHash = urlParams.get('check_qrcode') || request.qr_code;
    }

    // تغییر مسیر به eventoapi/v1/tickets/check
    const url = buildApiUrl('tickets/check');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCodeHash, // حذف user_id و count_check طبق داکیومنت جدید
      }),
    };

    const response = await this.makeRequest(url, options);

    if (response.status && typeof response.status === 'string') {
      const isSuccessfulStatus = ['success', 'valid', 'warning'].includes(response.status.toLowerCase());
      const result: ValidateTicketResponse = {
        status: isSuccessfulStatus ? 'SUCCESS' : 'FAIL',
        msg: response.msg || response.message || 'Response received',
      };

      result.name_customer = response.name_customer;
      result.seat = response.seat || response.ticket_id?.toString();
      result.checkin_time = response.checkin_time || response.check_in_time;
      result.ticket_id = response.ticket_id;
      result.e_cal = response.event_calendar;

      if (response.status.toLowerCase() === 'warning') {
        result.msg = response.msg || response.message || 'This ticket has already been checked.';
      }

      return result;
    } else {
      return {
        status: 'FAIL',
        msg: response.message || response.msg || 'Invalid API response',
      };
    }
  }

  async validateToken(websiteUrl?: string, request?: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    // چون این اندپوینت هنوز در meup/v1 است، ما base_url را جایگزین می‌کنیم
    const meupBaseUrl = API_BASE_URL.replace('eventoapi/v1', 'meup/v1');
    const url = `${meupBaseUrl.replace(/\/+$/, "")}/check_login`;
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: request.token }),
    };

    return this.makeRequest(url, options);
  }

  async logout(websiteUrl?: string, request?: LogoutRequest): Promise<LogoutResponse> {
    // تغییر مسیر به eventoapi/v1/logout
    const url = buildApiUrl('logout');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: request.token }),
    };

    return this.makeRequest(url, options);
  }
}

export const wordpressService = new WordPressService();