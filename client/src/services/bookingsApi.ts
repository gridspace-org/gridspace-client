
export interface Booking {
  _id: string;
  spaceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;
  guestCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  bookingType: 'hourly' | 'daily';
  specialRequests?: string;
  hostNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  space?: {
    _id: string;
    title: string;
    location: string;
    images: string[];
    amenities: string[];
  };
  user?: {
    _id: string;
    fullname: string;
    email: string;
    profilePic?: string;
  };
  hostEarnings?: number;
  canReschedule?: boolean;
  canCancel?: boolean;
}

export interface BookingsResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBookings: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CreateBookingRequest {
  spaceId: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  bookingType: 'hourly' | 'daily';
  specialRequests?: string;
}

export interface UpdateBookingStatusRequest {
  status: 'confirmed' | 'cancelled' | 'rejected';
  hostNotes?: string;
  cancellationReason?: 'user_request' | 'host_request' | 'payment_timeout' | 'other';
}

class BookingsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get user bookings
  async getUserBookings(params: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  } = {}): Promise<BookingsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/bookings${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<BookingsResponse>(endpoint);
  }

  // Get host bookings
  async getHostBookings(params: {
    page?: number;
    limit?: number;
    spaceId?: string;
    status?: string;
  } = {}): Promise<BookingsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.spaceId) searchParams.append('spaceId', params.spaceId);
    if (params.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/bookings/host${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<BookingsResponse>(endpoint);
  }

  // Create booking
  async createBooking(bookingData: CreateBookingRequest): Promise<{ success: boolean; message: string; data: Booking }> {
    return this.makeRequest<{ success: boolean; message: string; data: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Cancel booking (user)
  async cancelBooking(bookingId: string): Promise<{ success: boolean; message: string; data: { booking: Booking; refund: { amount: number; type: string; message: string } } }> {
    return this.makeRequest<{ success: boolean; message: string; data: { booking: Booking; refund: { amount: number; type: string; message: string } } }>(`/bookings/${bookingId}/cancel`, {
      method: 'DELETE',
    });
  }

  // Update booking status (host)
  async updateBookingStatus(bookingId: string, statusData: UpdateBookingStatusRequest): Promise<{ success: boolean; message: string; data: { booking: Booking } }> {
    return this.makeRequest<{ success: boolean; message: string; data: { booking: Booking } }>(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Get single booking details
  async getBookingById(bookingId: string): Promise<{ success: boolean; message: string; data: Booking }> {
    return this.makeRequest<{ success: boolean; message: string; data: Booking }>(`/bookings/${bookingId}`);
  }
}

export const bookingsApi = new BookingsApiService();
