import { storageService } from './storage';

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
    featured_image?: string;
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
    { ID: 1, post_title: 'رویداد کنسرت', post_content: 'کنسرت شگفت‌انگیز با هنرمندان برتر', event_date: '1404/10/25', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=رویداد+کنسرت' },
    { ID: 2, post_title: 'همایش فناوری', post_content: 'همایش سالانه فناوری با کارگاه‌های آموزشی', event_date: '1404/09/28', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=همایش+فناوری' },
    { ID: 3, post_title: 'نمایشگاه هنر', post_content: 'نمایشگاه هنرهای معاصر', event_date: '1404/09/09', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=نمایشگاه+هنر' },
    { ID: 4, post_title: 'جشنواره غذا', post_content: 'چشیدن بهترین غذاهای محلی از فروشندگان مختلف', event_date: '1404/07/18', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=جشنواره+غذا' },
    { ID: 5, post_title: 'جشنواره موسیقی', post_content: 'جشنواره چندروزه موسیقی با ژانرهای مختلف', event_date: '1404/06/14', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=جشنواره+موسیقی' },
    { ID: 6, post_title: 'مسابقه ورزشی', post_content: 'رقابت هیجان‌انگیز ورزشی با رویدادهای مختلف', event_date: '1404/06/01', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=مسابقه+ورزشی' },
    { ID: 7, post_title: 'اوج کسب‌وکار', post_content: 'گردهمایی سالانه رهبران و متخصصان کسب‌وکار', event_date: '1404/05/27', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=اوج+کسب‌وکار' },
    { ID: 8, post_title: 'نمایشگاه علوم', post_content: 'نمایش پروژه‌ها و تحقیقات نوآورانه', event_date: '1404/04/09', status: 'منتشر شده', featured_image: '/api/placeholder/600/400?text=نمایشگاه+علوم' }
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
        msg: 'ورود موفقیت‌آمیز',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };
    } else {
      return {
        status: 'FAIL',
        token: '',
        msg: 'نام کاربری یا رمز عبور نامعتبر است',
        user: undefined
      };
    }
  }

  async getEvents(websiteUrl: string, token: string): Promise<EventsResponse> {
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
    // Clear the stored token to simulate logout
    storageService.clearToken();
    
    return {
      status: 'SUCCESS',
      msg: 'با موفقیت خارج شدید'
    };
  }
}

export const mockWordPressService = new MockWordPressService();