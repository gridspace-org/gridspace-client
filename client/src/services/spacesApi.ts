
export interface Space {
  _id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  pricePerHour: number;
  pricePerDay?: number;
  pricePerWeek?: number;
  capacity: number;
  images: string[];
  amenities: string[];
  purposes: string[];
  hostId: {
    _id: string;
    fullname: string;
    profilePic?: string;
    emailVerified: boolean;
    createdAt: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpacesResponse {
  success: boolean;
  message: string;
  data: {
    spaces: Space[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSpaces: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface MySpacesResponse {
  success: boolean;
  message: string;
  data: {
    spaces: Space[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSpaces: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CreateSpaceRequest {
  title: string;
  description: string;
  location: string;
  address?: string;
  pricePerHour: number;
  pricePerDay?: number;
  pricePerWeek?: number;
  capacity: number;
  purposes: string[];
  amenities: string[];
  images?: string[]; // Optional for initial creation, can be added later
}

export interface UpdateSpaceRequest {
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerWeek?: number;
  capacity?: number;
  purposes?: string[];
  amenities?: string[];
  images?: string[];
  isActive?: boolean;
}

class SpacesApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grid-production-cb89.up.railway.app/api';
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    skipRefresh: boolean = false
  ): Promise<T> {
    const token = await this.getAuthToken();
    // If body is FormData, do not set Content-Type (browser will set the multipart boundary)
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Always include cookies for refresh token
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    let response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    // If 401 unauthorized and not already trying to refresh, try to refresh token and retry
    if (response.status === 401 && !skipRefresh && !endpoint.includes('/auth/refresh-token')) {
      try {
        // Try to refresh the token
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData?.data?.accessToken;
          
          if (newToken) {
            // Update token in localStorage
            localStorage.setItem('authToken', newToken);
            
            // Retry the original request with new token
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
            
            response = await fetch(`${this.baseUrl}${endpoint}`, config);
          }
        } else {
          // Refresh failed - clear auth
          localStorage.removeItem('authToken');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('authToken');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      const errorMessage = errorData.errors 
        ? `Validation Error: ${Array.isArray(errorData.errors) ? errorData.errors.join(', ') : errorData.errors}`
        : (errorData.message || `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Search and browse spaces
  async getSpaces(params: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    capacity?: number;
    purposes?: string[];
    amenities?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}): Promise<SpacesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.location) searchParams.append('location', params.location);
    if (params.priceMin) searchParams.append('priceMin', params.priceMin.toString());
    if (params.priceMax) searchParams.append('priceMax', params.priceMax.toString());
    if (params.capacity) searchParams.append('capacity', params.capacity.toString());
    if (params.purposes && params.purposes.length > 0) {
      searchParams.append('purposes', params.purposes.join(','));
    }
    if (params.amenities && params.amenities.length > 0) {
      searchParams.append('amenities', params.amenities.join(','));
    }
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);

    const queryString = searchParams.toString();
    const endpoint = `/spaces${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<SpacesResponse>(endpoint);
  }

  // Get space details
  async getSpaceById(id: string): Promise<{ success: boolean; message: string; data: Space }> {
    return this.makeRequest<{ success: boolean; message: string; data: Space }>(`/spaces/${id}`);
  }

  // Get my spaces (host only)
  async getMySpaces(params: { page?: number; limit?: number } = {}): Promise<MySpacesResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/spaces/my/spaces${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<MySpacesResponse>(endpoint);
  }

  // Create space (host only)
  async createSpace(
    spaceData: CreateSpaceRequest | FormData
  ): Promise<{ success: boolean; message: string; data: Space }> {
    // If the caller passed a FormData (contains files), forward it directly so multer on the server
    // receives files under the 'images' field (append files to key 'images')
    if (spaceData instanceof FormData) {
      return this.makeRequest<{ success: boolean; message: string; data: Space }>('/spaces', {
        method: 'POST',
        body: spaceData,
      });
    }

    return this.makeRequest<{ success: boolean; message: string; data: Space }>('/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  }

  // Update space (host only)
  async updateSpace(id: string, spaceData: UpdateSpaceRequest): Promise<{ success: boolean; message: string; data: Space }> {
    return this.makeRequest<{ success: boolean; message: string; data: Space }>(`/spaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spaceData),
    });
  }

  // Delete space (host only)
  async deleteSpace(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/spaces/${id}`, {
      method: 'DELETE',
    });
  }
}

export const spacesApi = new SpacesApiService();

