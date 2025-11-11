import axios, { AxiosInstance, AxiosResponse, isAxiosError } from 'axios';

// Types
export interface User {
  _id: string;
  fullname: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  phoneNumber?: string;
  isActive: boolean;
  suspension: {
    isSuspended: boolean;
    reason: string | null;
    details: string | null;
    suspendedBy: string | null;
    suspendedAt: string | null;
    resumeAt: string | null;
  };
  createdAt: string;
}

export interface Space {
  _id: string;
  title: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
  };
  host: {
    _id: string;
    fullname: string;
    email: string;
  };
  images?: string[];
  pricePerHour?: number;
  pricePerDay?: number;
  description?: string;
  amenities?: string[];
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  moderation?: {
    reviewedBy?: string;
    reviewedAt?: string;
    reason?: string;
  };
  createdAt: string;
}

export interface Booking {
  _id: string;
  user: {
    _id: string;
    fullname: string;
    email: string;
  };
  space: {
    _id: string;
    title: string;
  };
  host: {
    _id: string;
    fullname: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  status: 'pending' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalPrice: number;
  createdAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalUsers?: number;
  totalSpaces?: number;
  totalBookings?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: PaginationMeta;
  };
}

export interface SpacesResponse {
  success: boolean;
  message: string;
  data: {
    spaces: Space[];
    pagination: PaginationMeta;
  };
}

export interface BookingsResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    pagination: PaginationMeta;
  };
}

export interface SuspendUserData {
  reason: 'fraud' | 'policy_violation' | 'chargeback_dispute' | 'abuse' | 'other';
  details?: string;
  resumeAt?: string;
}

export interface ReactivateUserData {
  reason?: string;
}

export interface ApproveSpaceData {
  notes?: string;
}

export interface RejectSpaceData {
  reason: string;
}

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://grid-production-cb89.up.railway.app/api";

class AdminApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Always include cookies for refresh token
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth headers
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        console.error("Admin API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message,
        });
        
        // Check if error is 401 and we haven't already tried to refresh
        // AND the failed request is not the refresh-token endpoint itself
        if (
          error.response?.status === 401 && 
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh-token')
        ) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const response = await this.axiosInstance.post('/auth/refresh-token', {}, {
              _skipAuthRefresh: true // Custom flag to skip interceptor on this request
            } as any);
            const newToken = response.data?.data?.accessToken;
            
            if (newToken) {
              // Update token in localStorage
              localStorage.setItem('authToken', newToken);
              
              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Retry the original request with new token
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear auth
            console.error('Token refresh failed:', refreshError);
            localStorage.removeItem('authToken');
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle responses
  private async handleResponse<T>(response: AxiosResponse): Promise<T> {
    return response.data as T;
  }

  // Helper method to handle errors
  private handleError(error: unknown): never {
    console.error("Admin API Error in handleError:", error);

    let errorMessage = "Server error occurred";

    if (isAxiosError(error)) {
      const data: unknown = error.response?.data;
      const maybeRecord = (val: unknown): val is Record<string, unknown> =>
        typeof val === 'object' && val !== null;
      const serverMessage = maybeRecord(data)
        ? (typeof data.message === 'string' ? data.message : undefined) ||
          (typeof (data as Record<string, unknown>).error === 'string' ? (data as Record<string, unknown>).error as string : undefined)
        : undefined;
      errorMessage = serverMessage || error.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }

  // List Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: 'user' | 'host' | 'admin';
    status?: 'active' | 'suspended';
    search?: string;
  }): Promise<UsersResponse> {
    try {
      const response = await this.axiosInstance.get('/admin/users', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // List Spaces
  async getSpaces(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
    hostId?: string;
    search?: string;
  }): Promise<SpacesResponse> {
    try {
      const response = await this.axiosInstance.get('/admin/spaces', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // List Bookings
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
    userId?: string;
    hostId?: string;
  }): Promise<BookingsResponse> {
    try {
      const response = await this.axiosInstance.get('/admin/bookings', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Suspend User
  async suspendUser(userId: string, data: SuspendUserData): Promise<{ success: boolean; message: string; data: User }> {
    try {
      const response = await this.axiosInstance.post(`/admin/users/${userId}/suspend`, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Reactivate User
  async reactivateUser(userId: string, data?: ReactivateUserData): Promise<{ success: boolean; message: string; data: User }> {
    try {
      const response = await this.axiosInstance.post(`/admin/users/${userId}/reactivate`, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Approve Space
  async approveSpace(spaceId: string, data?: ApproveSpaceData): Promise<{ success: boolean; message: string; data: Space }> {
    try {
      const response = await this.axiosInstance.post(`/admin/spaces/${spaceId}/approve`, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Reject Space
  async rejectSpace(spaceId: string, data: RejectSpaceData): Promise<{ success: boolean; message: string; data: Space }> {
    try {
      const response = await this.axiosInstance.post(`/admin/spaces/${spaceId}/reject`, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

const adminApiService = new AdminApiService();
export default adminApiService;
