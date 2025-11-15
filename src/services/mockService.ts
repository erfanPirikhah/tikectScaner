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
    { id: 1, name: 'Test User', email: 'test@example.com', username: 'testuser', password: 'password123' }
  ];

  private mockEvents = [
    { ID: 1, post_title: 'Concert Event', post_content: 'Amazing concert with top artists', event_date: '2025-12-15', status: 'published' },
    { ID: 2, post_title: 'Tech Conference', post_content: 'Annual tech conference with workshops', event_date: '2025-11-20', status: 'published' },
    { ID: 3, post_title: 'Art Exhibition', post_content: 'Contemporary art exhibition', event_date: '2025-11-30', status: 'published' }
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
        msg: 'Login successful',
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
        msg: 'Invalid username or password',
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
        msg: 'Invalid or expired token'
      };
    }

    return {
      status: 'SUCCESS',
      events: this.mockEvents,
      msg: 'Events retrieved successfully'
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
        msg: 'Ticket validation failed: ' + 
          (request.qr_code === 'invalid_ticket' ? 'Invalid ticket' :
           request.qr_code === 'used_ticket' ? 'Ticket already used' :
           'Ticket expired'),
        ticket_id: 123
      };
    }

    // Success case - simulate a valid ticket
    return {
      status: 'SUCCESS',
      msg: 'Ticket validated successfully',
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
        msg: 'Token is valid'
      };
    } else {
      return {
        status: 'FAIL',
        msg: 'Invalid or expired token'
      };
    }
  }

  async logout(websiteUrl: string, request: LogoutRequest): Promise<LogoutResponse> {
    // Clear the stored token to simulate logout
    storageService.clearToken();
    
    return {
      status: 'SUCCESS',
      msg: 'Logged out successfully'
    };
  }
}

export const mockWordPressService = new MockWordPressService();