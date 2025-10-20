import { useAppSelector } from "@/store/hooks";

export interface Space {
  _id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  pricePerHour: number;
  capacity: number;
  images: string[];
  amenities: string[];
  purposes: string[];
  hostId: {
    _id: string;
    fullname: string;
    profilePic?: string;
    emailVerified: boolean;
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
  capacity: number;
  purposes: string[];
  amenities: string[];
}

export interface UpdateSpaceRequest {
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  pricePerHour?: number;
  capacity?: number;
  purposes?: string[];
  amenities?: string[];
}

class SpacesApiService {
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
    if (params.purposes) searchParams.append('purposes', params.purposes.join(','));
    if (params.amenities) searchParams.append('amenities', params.amenities.join(','));
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);

    const queryString = searchParams.toString();
    const endpoint = `/api/spaces${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<SpacesResponse>(endpoint);
  }

  // Get space details
  async getSpaceById(id: string): Promise<{ success: boolean; message: string; data: Space }> {
    return this.makeRequest<{ success: boolean; message: string; data: Space }>(`/api/spaces/${id}`);
  }

  // Get my spaces (host only)
  async getMySpaces(params: { page?: number; limit?: number } = {}): Promise<MySpacesResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/spaces/my/spaces${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<MySpacesResponse>(endpoint);
  }

  // Create space (host only)
  async createSpace(spaceData: CreateSpaceRequest): Promise<{ success: boolean; message: string; data: Space }> {
    return this.makeRequest<{ success: boolean; message: string; data: Space }>('/api/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  }

  // Update space (host only)
  async updateSpace(id: string, spaceData: UpdateSpaceRequest): Promise<{ success: boolean; message: string; data: Space }> {
    return this.makeRequest<{ success: boolean; message: string; data: Space }>(`/api/spaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spaceData),
    });
  }

  // Delete space (host only)
  async deleteSpace(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/api/spaces/${id}`, {
      method: 'DELETE',
    });
  }
}

export const spacesApi = new SpacesApiService();

