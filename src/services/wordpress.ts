import { useAuthStore } from '@/lib/store';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  status: string;
  token: string;
  msg: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface EventsResponse {
  status: string;
  events: Array<{
    ID: number;
    post_title: string;
    post_content: string;
    event_date: string;
    status: string;
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call to ${url} failed:`, error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials, websiteUrl: string): Promise<LoginResponse> {
    const url = `${websiteUrl}wp-json/app/login/`;

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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call to ${url} failed:`, error);
      throw error;
    }
  }

  async getEvents(websiteUrl: string, token: string): Promise<EventsResponse> {
    if (!token) {
      throw new Error('No authentication token available');
    }

    return this.makeRequest(websiteUrl, 'wp-json/app/events/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async validateTicket(websiteUrl: string, request: ValidateTicketRequest): Promise<ValidateTicketResponse> {
    return this.makeRequest(websiteUrl, 'wp-json/app/check-ticket/', {
      method: 'POST',
      body: JSON.stringify({
        event_id: request.event_id,
        qr_code: request.qr_code,
        token: request.token,
      }),
    });
  }

  async validateToken(websiteUrl: string, request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    return this.makeRequest(websiteUrl, 'wp-json/app/validate-token/', {
      method: 'POST',
      body: JSON.stringify({
        token: request.token,
      }),
    });
  }

  async logout(websiteUrl: string, request: LogoutRequest): Promise<LogoutResponse> {
    return this.makeRequest(websiteUrl, 'wp-json/app/logout/', {
      method: 'POST',
      body: JSON.stringify({
        token: request.token,
      }),
    });
  }
}

export const wordpressService = new WordPressService();