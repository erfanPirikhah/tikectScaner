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
  ticket_status?: string;
  name_event?: string;
  ticket_type?: string;
  extra_service?: string;
  times_checked?: string;
  checks_remaining?: string;
  between_date?: string;
  msg_show?: string;
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
      } else if (data.events && Array.isArray(data.events)) {
        return { status: 'SUCCESS', events: data.events };
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
    // رفع ارور: اطمینان از وجود آبجکت request
    if (!request) throw new Error('درخواست اعتبارسنجی نامعتبر است');
    
    let qrCodeHash = request.qr_code;
    if (request.qr_code.includes('itiket.ir')) {
      const urlParams = new URLSearchParams(request.qr_code.split('?')[1]);
      qrCodeHash = urlParams.get('check_qrcode') || request.qr_code;
    }

    const url = buildApiUrl('tickets/check');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCodeHash,
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

      result.ticket_status = response.ticket_status;
      result.name_event = response.name_event;
      result.ticket_type = response.ticket_type;
      result.extra_service = response.extra_service;
      result.times_checked = response.times_checked?.toString();
      result.checks_remaining = response.checks_remaining?.toString();
      result.between_date = response.between_date;
      result.msg_show = response.msg_show;

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
    // رفع ارور: اطمینان از وجود آبجکت request
    if (!request) throw new Error('توکن نامعتبر است');

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
    // رفع ارور: اطمینان از وجود آبجکت request
    if (!request) throw new Error('توکن نامعتبر است');

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

  async getTickets(websiteUrl?: string, token?: string, eventId?: number, page: number = 1, perPage: number = 20): Promise<any> {
    if (!token) throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    
    const url = buildApiUrl('tickets');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        event_id: eventId,
        page: page,
        per_page: perPage 
      }),
    };

    try {
      const data = await this.makeRequest(url, options);
      
      if (data.items && Array.isArray(data.items)) {
        return { 
          status: 'SUCCESS', 
          tickets: data.items,
          total_items: data.total_items || 0,
          total_checked: data.total_checked || 0,
          total_active: data.total_active || 0,
          total_pages: data.total_pages || 1,
          current_page: data.page || 1
        };
      } else if (Array.isArray(data)) {
        return { status: 'SUCCESS', tickets: data, total_items: data.length, total_pages: 1 };
      } else if (data.status) {
        return data;
      }
      
      return { status: 'FAIL', tickets: [], msg: data.msg || 'خطا در دریافت بلیت‌ها' };
    } catch (error) {
      throw error;
    }
  }

  async manualSearchTicket(websiteUrl?: string, token?: string, eventId?: number, searchTerm?: string): Promise<any> {
    if (!token) throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    
    const url = buildApiUrl('tickets/manual-search');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        event_id: eventId,
        search_value: searchTerm 
      }),
    };

    try {
      const data = await this.makeRequest(url, options);
      
      if (data.items && Array.isArray(data.items)) {
        return { status: 'SUCCESS', tickets: data.items };
      } else if (Array.isArray(data)) {
        return { status: 'SUCCESS', tickets: data };
      } else if (data.status) {
        return data;
      }
      
      return { status: 'FAIL', tickets: [], msg: data.msg || 'بلیتی یافت نشد' };
    } catch (error) {
      throw error;
    }
  }

  async getTicketDetails(websiteUrl?: string, token?: string, ticketId?: number): Promise<any> {
    if (!token) throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    
    const url = buildApiUrl('ticket/details');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_id: ticketId }),
    };

    try {
      const data = await this.makeRequest(url, options);
      
      if (data.ticket_id || (data.items && data.items.length > 0)) {
        return { status: 'SUCCESS', ticket: data.items ? data.items[0] : data };
      } else if (data.status) {
        return data;
      }
      
      return { status: 'FAIL', msg: data.msg || 'خطا در دریافت جزئیات بلیت' };
    } catch (error) {
      throw error;
    }
  }

  async getBookings(websiteUrl?: string, token?: string, eventId?: number, page: number = 1, perPage: number = 20): Promise<any> {
    if (!token) throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    
    const url = buildApiUrl('bookings');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        event_id: eventId,
        page: page,
        per_page: perPage 
      }),
    };

    try {
      const data = await this.makeRequest(url, options);
      
      if (data.items && Array.isArray(data.items)) {
        return { 
          status: 'SUCCESS', 
          bookings: data.items,
          total_items: data.total_items || 0,
          total_pages: data.total_pages || 1,
          current_page: data.page || 1
        };
      } else if (Array.isArray(data)) {
        return { status: 'SUCCESS', bookings: data, total_items: data.length, total_pages: 1 };
      } else if (data.status) {
        return data;
      }
      
      return { status: 'FAIL', bookings: [], msg: data.msg || 'خطا در دریافت رزروها' };
    } catch (error) {
      throw error;
    }
  }

  async getBookingDetails(websiteUrl?: string, token?: string, bookingId?: number): Promise<any> {
    if (!token) throw new Error('هیچ توکن احراز هویتی در دسترس نیست');
    
    const url = buildApiUrl('booking/details');
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ booking_id: bookingId }),
    };

    try {
      const data = await this.makeRequest(url, options);
      
      if (data.booking_id || (data.items && data.items.length > 0)) {
        return { status: 'SUCCESS', booking: data.items ? data.items[0] : data };
      } else if (data.status) {
        return data;
      }
      
      return { status: 'FAIL', msg: data.msg || 'خطا در دریافت جزئیات رزرو' };
    } catch (error) {
      throw error;
    }
  }
}

export const wordpressService = new WordPressService();