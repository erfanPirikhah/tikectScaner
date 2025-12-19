import { storageService } from './storage';
import { getBaseUrlWithoutSubdomain } from '@/lib/utils';

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

class MockWordPressService {
  private mockUsers = [
    { id: 1, name: 'کاربر تست', email: 'test@example.com', username: 'testuser', password: 'password123' }
  ];

  private mockEvents = [
    { event_id: 1, event_name: 'رویداد کنسرت' },
    { event_id: 2, event_name: 'همایش فناوری' },
    { event_id: 3, event_name: 'نمایشگاه هنر' },
    { event_id: 4, event_name: 'جشنواره غذا' },
    { event_id: 5, event_name: 'جشنواره موسیقی' },
    { event_id: 6, event_name: 'مسابقه ورزشی' },
    { event_id: 7, event_name: 'اوج کسب‌وکار' },
    { event_id: 8, event_name: 'نمایشگاه علوم' }
  ];

  private validateTokenInternal(token: string): { valid: boolean; user?: any } {
    // In a real scenario, we'd validate the token properly
    // For mock, we'll just check if it's in our "active" tokens
    const storedToken = storageService.getToken();
    if (storedToken === token) {
      // We'll simulate user data based on stored info
      const userData = {
        id: 1,
        name: 'Test User'
      };
      return { valid: true, user: userData };
    }
    
    return { valid: false };
  }

  async login(credentials: LoginCredentials, websiteUrl: string): Promise<LoginResponse> {
    // Normalize website URL to ensure consistent format (though not used in mock service)
    const normalizedWebsiteUrl = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user by credentials
    const user = this.mockUsers.find(u =>
      u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      // Generate a mock token (in a real system, this would come from the server)
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        status: 'SUCCESS',
        token: token,
        code: 200,
        email: user.email,
        user_id: user.id,
        username: user.username,
        msg: 'ورود موفقیت‌آمیز'
      };
    } else {
      return {
        status: 'FAIL',
        token: '',
        code: 401,
        email: '',
        user_id: 0,
        username: '',
        msg: 'نام کاربری یا رمز عبور نامعتبر است'
      };
    }
  }

  async getEvents(websiteUrl: string, token: string, userId: number): Promise<EventsResponse> {
    // Normalize website URL to ensure consistent format (though not used in mock service)
    const normalizedWebsiteUrl = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const validation = this.validateTokenInternal(token);

    if (!validation.valid) {
      return {
        status: 'FAIL',
        events: [],
        msg: 'توکن نامعتبر یا منقضی شده است'
      };
    }

    return {
      status: 'SUCCESS',
      events: this.mockEvents,
      msg: 'رویدادها با موفقیت بازیابی شدند'
    };
  }

  async validateTicket(websiteUrl: string, request: ValidateTicketRequest): Promise<ValidateTicketResponse> {
    // Normalize website URL to ensure consistent format (though not used in mock service)
    const normalizedWebsiteUrl = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const validation = this.validateTokenInternal(request.token);
    
    if (!validation.valid) {
      return {
        status: 'FAIL',
        msg: 'Invalid or expired token'
      };
    }

    // In a real system, this would validate the QR code against the event
    // For mock, we'll just return success for valid tickets
    // and simulate different responses based on the QR code content
    
    // For demo purposes, we'll make certain QR codes fail
    const failCodes = ['invalid_ticket', 'used_ticket', 'expired_ticket'];

    if (failCodes.includes(request.qr_code)) {
      return {
        status: 'FAIL',
        msg: 'اعتبارسنجی بلیت ناموفق بود: ' +
          (request.qr_code === 'invalid_ticket' ? 'بلیت نامعتبر است' :
           request.qr_code === 'used_ticket' ? 'بلیت قبلاً استفاده شده است' :
           'بلیت منقضی شده است'),
        ticket_id: 123
      };
    }

    // Success case - simulate a valid ticket
    return {
      status: 'SUCCESS',
      msg: 'بلیت با موفقیت معتبرسنجی شد',
      name_customer: 'John Doe',
      seat: 'A-15',
      checkin_time: new Date().toISOString(),
      e_cal: '2025-11-20T19:00:00Z',
      ticket_id: 123
    };
  }

  async validateToken(websiteUrl: string, request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    // Normalize website URL to ensure consistent format (though not used in mock service)
    const normalizedWebsiteUrl = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl;

    const validation = this.validateTokenInternal(request.token);

    if (validation.valid) {
      return {
        status: 'SUCCESS',
        user: validation.user,
        msg: 'توکن معتبر است'
      };
    } else {
      return {
        status: 'FAIL',
        msg: 'توکن نامعتبر یا منقضی شده است'
      };
    }
  }

  async logout(websiteUrl: string, request: LogoutRequest): Promise<LogoutResponse> {
    // Normalize website URL to ensure consistent format (though not used in mock service)
    const normalizedWebsiteUrl = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl;

    // Clear the stored token to simulate logout
    storageService.setToken(null);

    return {
      status: 'SUCCESS',
      msg: 'با موفقیت خارج شدید'
    };
  }
}

export const mockWordPressService = new MockWordPressService();